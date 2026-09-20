import { CounselingRequestStatus } from "@prisma/client";
import { ValidationError } from "@/shared/errors";

export const ALLOWED_STATUS_TRANSITIONS: Record<CounselingRequestStatus, CounselingRequestStatus[]> = {
  NEW: [
    CounselingRequestStatus.CONTACTED,
    CounselingRequestStatus.CANCELLED,
    CounselingRequestStatus.DECLINED,
    CounselingRequestStatus.UNRESPONSIVE,
  ],
  CONTACTED: [
    CounselingRequestStatus.INTAKE_COMPLETED,
    CounselingRequestStatus.MATCHING,
    CounselingRequestStatus.CANCELLED,
    CounselingRequestStatus.DECLINED,
    CounselingRequestStatus.UNRESPONSIVE,
  ],
  INTAKE_COMPLETED: [
    CounselingRequestStatus.MATCHING,
    CounselingRequestStatus.PSYCHOLOGIST_SELECTED,
    CounselingRequestStatus.CANCELLED,
    CounselingRequestStatus.DECLINED,
  ],
  MATCHING: [
    CounselingRequestStatus.PSYCHOLOGIST_SELECTED,
    CounselingRequestStatus.CANCELLED,
    CounselingRequestStatus.DECLINED,
  ],
  PSYCHOLOGIST_SELECTED: [
    CounselingRequestStatus.AVAILABILITY_CONFIRMED,
    CounselingRequestStatus.MATCHING, // Rematching if psychologist unavailable
    CounselingRequestStatus.CANCELLED,
    CounselingRequestStatus.DECLINED,
  ],
  AVAILABILITY_CONFIRMED: [
    CounselingRequestStatus.PAYMENT_PENDING,
    CounselingRequestStatus.BOOKED,
    CounselingRequestStatus.CANCELLED,
  ],
  PAYMENT_PENDING: [
    CounselingRequestStatus.BOOKED,
    CounselingRequestStatus.CANCELLED,
    CounselingRequestStatus.DECLINED,
  ],
  BOOKED: [
    CounselingRequestStatus.COMPLETED,
    CounselingRequestStatus.CANCELLED,
  ],
  COMPLETED: [
    CounselingRequestStatus.FOLLOW_UP,
    CounselingRequestStatus.CLOSED,
  ],
  FOLLOW_UP: [
    CounselingRequestStatus.CLOSED,
    CounselingRequestStatus.MATCHING, // Re-booking/matching for ongoing care
  ],
  CLOSED: [], // Terminal
  CANCELLED: [], // Terminal
  UNRESPONSIVE: [
    CounselingRequestStatus.CONTACTED, // Can re-open if client responds
    CounselingRequestStatus.CLOSED,
  ],
  DECLINED: [], // Terminal
};

export class CoordinationStateMachine {
  /**
   * Checks if a transition from currentStatus to newStatus is valid.
   */
  static canTransition(current: CounselingRequestStatus, next: CounselingRequestStatus): boolean {
    if (current === next) return true;
    const allowed = ALLOWED_STATUS_TRANSITIONS[current] || [];
    return allowed.includes(next);
  }

  /**
   * Enforces transition validity or throws a descriptive ValidationError.
   */
  static validateTransition(current: CounselingRequestStatus, next: CounselingRequestStatus): void {
    if (!this.canTransition(current, next)) {
      throw new ValidationError(
        `Invalid status transition: Cannot change counseling request from '${current}' to '${next}'. Allowed next states: [${(
          ALLOWED_STATUS_TRANSITIONS[current] || []
        ).join(", ")}]`
      );
    }
  }

  /**
   * Determines if a status is terminal (cannot be advanced further).
   */
  static isTerminal(status: CounselingRequestStatus): boolean {
    return (ALLOWED_STATUS_TRANSITIONS[status] || []).length === 0;
  }
}
