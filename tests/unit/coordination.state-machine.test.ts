import { describe, it, expect } from "vitest";
import {
  CoordinationStateMachine,
  ALLOWED_STATUS_TRANSITIONS,
} from "@/modules/coordination/coordination.state-machine";
import { CounselingRequestStatus } from "@prisma/client";
import { ValidationError } from "@/shared/errors";

describe("CoordinationStateMachine", () => {
  it("should allow valid standard forward transitions", () => {
    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.NEW,
        CounselingRequestStatus.CONTACTED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.CONTACTED,
        CounselingRequestStatus.INTAKE_COMPLETED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.INTAKE_COMPLETED,
        CounselingRequestStatus.MATCHING
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.MATCHING,
        CounselingRequestStatus.PSYCHOLOGIST_SELECTED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.PSYCHOLOGIST_SELECTED,
        CounselingRequestStatus.AVAILABILITY_CONFIRMED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.AVAILABILITY_CONFIRMED,
        CounselingRequestStatus.PAYMENT_PENDING
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.PAYMENT_PENDING,
        CounselingRequestStatus.BOOKED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.BOOKED,
        CounselingRequestStatus.COMPLETED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.COMPLETED,
        CounselingRequestStatus.FOLLOW_UP
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.FOLLOW_UP,
        CounselingRequestStatus.CLOSED
      )
    ).toBe(true);
  });

  it("should allow same-status transitions (noop)", () => {
    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.MATCHING,
        CounselingRequestStatus.MATCHING
      )
    ).toBe(true);
  });

  it("should allow valid cancellation and exception paths", () => {
    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.NEW,
        CounselingRequestStatus.CANCELLED
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.CONTACTED,
        CounselingRequestStatus.UNRESPONSIVE
      )
    ).toBe(true);

    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.UNRESPONSIVE,
        CounselingRequestStatus.CONTACTED
      )
    ).toBe(true);
  });

  it("should reject illegal skipping transitions", () => {
    expect(
      CoordinationStateMachine.canTransition(
        CounselingRequestStatus.NEW,
        CounselingRequestStatus.BOOKED
      )
    ).toBe(false);

    expect(() =>
      CoordinationStateMachine.validateTransition(
        CounselingRequestStatus.NEW,
        CounselingRequestStatus.COMPLETED
      )
    ).toThrow(ValidationError);
  });

  it("should correctly identify terminal states", () => {
    expect(CoordinationStateMachine.isTerminal(CounselingRequestStatus.CLOSED)).toBe(true);
    expect(CoordinationStateMachine.isTerminal(CounselingRequestStatus.CANCELLED)).toBe(true);
    expect(CoordinationStateMachine.isTerminal(CounselingRequestStatus.DECLINED)).toBe(true);
    expect(CoordinationStateMachine.isTerminal(CounselingRequestStatus.NEW)).toBe(false);
    expect(CoordinationStateMachine.isTerminal(CounselingRequestStatus.MATCHING)).toBe(false);
  });
});
