import { prisma } from "@/shared/database/prisma";
import { UserRole } from "@prisma/client";
import { ConflictError, ForbiddenError, NotFoundError, ValidationError } from "@/shared/errors";
import { SessionWithUser } from "@/modules/identity/session.service";
import { minorToMajorString } from "@/shared/types/money";
import { SlugService } from "@/shared/slug/slug.service";
import { AuditService } from "@/modules/audit/audit.service";

export interface CreateEventInput {
  title: string;
  description: string;
  startDateTimeUtc: string;
  endDateTimeUtc: string;
  timezone?: string;
  maxCapacity: number;
  priceMinor?: bigint;
  currency?: string;
}

export class EventService {
  /**
   * Psychologist schedules a new group workshop or webinar event.
   */
  static async createEvent(userId: string, input: CreateEventInput) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    if (!input.title || input.title.trim().length < 3) {
      throw new ValidationError("Event title must be at least 3 characters");
    }
    if (!input.description || input.description.trim().length < 10) {
      throw new ValidationError("Event description must be at least 10 characters");
    }

    const start = new Date(input.startDateTimeUtc);
    const end = new Date(input.endDateTimeUtc);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError("Invalid start or end date format");
    }
    if (end <= start) {
      throw new ValidationError("Event end time must be after start time");
    }
    if (input.maxCapacity < 1) {
      throw new ValidationError("Max capacity must be at least 1");
    }

    let candidate = SlugService.normalize(input.title);
    if (!candidate || candidate.length < 3) candidate = "event";
    let slug = candidate;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${candidate}-${counter++}`;
    }

    const event = await prisma.event.create({
      data: {
        hostPsychologistId: profile.id,
        slug,
        title: input.title.trim(),
        description: input.description.trim(),
        startDateTimeUtc: start,
        endDateTimeUtc: end,
        timezone: input.timezone || "UTC",
        maxCapacity: input.maxCapacity,
        priceMinor: input.priceMinor ?? 0n,
        currency: input.currency || "INR",
        isPublished: false,
      },
    });

    await AuditService.log({
      actorUserId: userId,
      action: "EVENT_CREATED",
      entityType: "Event",
      entityId: event.id,
      safeMetadata: { slug: event.slug, maxCapacity: input.maxCapacity },
    });

    return event;
  }

  /**
   * Publishes or unpublishes an event.
   */
  static async setPublicationStatus(session: SessionWithUser, eventId: string, isPublished: boolean) {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { host: true },
    });
    if (!event) throw new NotFoundError("Event not found");

    const isAdmin = session.user.roles.includes(UserRole.ADMIN);
    const isHost = event.host?.userId === session.user.id;

    if (!isAdmin && !isHost) {
      throw new ForbiddenError("Only the event host or administrator can publish this event");
    }

    return prisma.event.update({
      where: { id: eventId },
      data: { isPublished },
    });
  }

  /**
   * Lists upcoming published events for discovery.
   */
  static async listPublicEvents() {
    try {
      const now = new Date();
      const events = await prisma.event.findMany({
        where: {
          isPublished: true,
          endDateTimeUtc: { gte: now },
        },
        orderBy: { startDateTimeUtc: "asc" },
        include: {
          host: {
            select: { id: true, fullName: true, professionalTitle: true, slug: true },
          },
          _count: {
            select: { registrations: true },
          },
        },
      });

      return events.map((e) => ({
        id: e.id,
        slug: e.slug,
        title: e.title,
        description: e.description,
        startDateTimeUtc: e.startDateTimeUtc.toISOString(),
        endDateTimeUtc: e.endDateTimeUtc.toISOString(),
        timezone: e.timezone,
        maxCapacity: e.maxCapacity,
        registeredCount: e._count.registrations,
        remainingSeats: Math.max(0, e.maxCapacity - e._count.registrations),
        isSoldOut: e._count.registrations >= e.maxCapacity,
        priceMajor: minorToMajorString(e.priceMinor),
        currency: e.currency,
        host: e.host
          ? {
              name: e.host.fullName,
              title: e.host.professionalTitle,
              slug: e.host.slug,
            }
          : null,
      }));
    } catch {
      return [];
    }
  }

  /**
   * Retrieves single public event by slug with seat availability.
   */
  static async getPublicEventBySlug(slug: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: {
        host: {
          select: { id: true, fullName: true, professionalTitle: true, slug: true, bio: true },
        },
        _count: {
          select: { registrations: true },
        },
      },
    });

    if (!event || !event.isPublished) {
      throw new NotFoundError("Event not found or not published");
    }

    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      description: event.description,
      startDateTimeUtc: event.startDateTimeUtc.toISOString(),
      endDateTimeUtc: event.endDateTimeUtc.toISOString(),
      timezone: event.timezone,
      maxCapacity: event.maxCapacity,
      registeredCount: event._count.registrations,
      remainingSeats: Math.max(0, event.maxCapacity - event._count.registrations),
      isSoldOut: event._count.registrations >= event.maxCapacity,
      priceMajor: minorToMajorString(event.priceMinor),
      currency: event.currency,
      host: event.host,
    };
  }

  /**
   * Registers a client for an event with atomic capacity check to prevent overselling.
   */
  static async registerForEvent(clientUserId: string, eventId: string) {
    const client = await prisma.clientProfile.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new NotFoundError("Client profile not found");

    return prisma.$transaction(async (tx) => {
      const event = await tx.event.findUnique({
        where: { id: eventId },
        include: {
          _count: { select: { registrations: true } },
        },
      });

      if (!event) throw new NotFoundError("Event not found");
      if (!event.isPublished) throw new ValidationError("Cannot register for unpublished event");

      if (event._count.registrations >= event.maxCapacity) {
        throw new ConflictError("Event has reached maximum capacity and is completely booked");
      }

      const existingReg = await tx.eventRegistration.findUnique({
        where: {
          eventId_clientId: {
            eventId,
            clientId: client.id,
          },
        },
      });

      if (existingReg) {
        throw new ConflictError("You are already registered for this event");
      }

      const registration = await tx.eventRegistration.create({
        data: {
          eventId,
          clientId: client.id,
        },
      });

      await AuditService.log({
        actorUserId: clientUserId,
        action: "EVENT_REGISTERED",
        entityType: "EventRegistration",
        entityId: registration.id,
        safeMetadata: { eventId, clientId: client.id },
      });

      return {
        registrationId: registration.id,
        registeredAt: registration.registeredAt.toISOString(),
        eventTitle: event.title,
      };
    });
  }

  /**
   * Cancels a client's registration.
   */
  static async cancelRegistration(clientUserId: string, eventId: string) {
    const client = await prisma.clientProfile.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new NotFoundError("Client profile not found");

    const reg = await prisma.eventRegistration.findUnique({
      where: {
        eventId_clientId: {
          eventId,
          clientId: client.id,
        },
      },
    });

    if (!reg) {
      throw new NotFoundError("No registration found for this event");
    }

    await prisma.eventRegistration.delete({
      where: { id: reg.id },
    });

    await AuditService.log({
      actorUserId: clientUserId,
      action: "EVENT_REGISTRATION_CANCELLED",
      entityType: "EventRegistration",
      entityId: reg.id,
    });
  }

  /**
   * Lists all events registered by a client.
   */
  static async getClientEvents(clientUserId: string) {
    const client = await prisma.clientProfile.findUnique({ where: { userId: clientUserId } });
    if (!client) throw new NotFoundError("Client profile not found");

    const registrations = await prisma.eventRegistration.findMany({
      where: { clientId: client.id },
      include: {
        event: {
          include: {
            host: { select: { fullName: true, professionalTitle: true } },
          },
        },
      },
      orderBy: { event: { startDateTimeUtc: "asc" } },
    });

    return registrations.map((r) => ({
      registrationId: r.id,
      registeredAt: r.registeredAt.toISOString(),
      event: {
        id: r.event.id,
        slug: r.event.slug,
        title: r.event.title,
        description: r.event.description,
        startDateTimeUtc: r.event.startDateTimeUtc.toISOString(),
        endDateTimeUtc: r.event.endDateTimeUtc.toISOString(),
        timezone: r.event.timezone,
        hostName: r.event.host?.fullName || "Staff Clinician",
      },
    }));
  }

  /**
   * Lists all events hosted by a psychologist with attendee stats.
   */
  static async getPsychologistEvents(userId: string) {
    const profile = await prisma.psychologistProfile.findUnique({ where: { userId } });
    if (!profile) throw new NotFoundError("Psychologist profile not found");

    const events = await prisma.event.findMany({
      where: { hostPsychologistId: profile.id },
      orderBy: { startDateTimeUtc: "desc" },
      include: {
        _count: { select: { registrations: true } },
        registrations: {
          include: {
            client: { select: { fullName: true } },
          },
        },
      },
    });

    return events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      description: e.description,
      startDateTimeUtc: e.startDateTimeUtc.toISOString(),
      endDateTimeUtc: e.endDateTimeUtc.toISOString(),
      timezone: e.timezone,
      maxCapacity: e.maxCapacity,
      registeredCount: e._count.registrations,
      isPublished: e.isPublished,
      attendees: e.registrations.map((r) => ({
        registrationId: r.id,
        clientName: r.client.fullName,
        registeredAt: r.registeredAt.toISOString(),
      })),
    }));
  }
}
