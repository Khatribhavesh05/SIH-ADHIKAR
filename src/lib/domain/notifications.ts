import type { NotificationType } from "@prisma/client";

/**
 * Section 15: a person interested in land may object to a Section 11
 * preliminary notification within 21 days of its publication.
 */
export const OBJECTION_WINDOW_DAYS_S11 = 21;

/**
 * The Act does not define a further public-objection window for a Section
 * 19 declaration — objections are resolved earlier, via the Section 15
 * report that precedes declaration (see DOCS/Land-Acquisition-Process-
 * Research.pdf, Stage 5). The `objectionWindowDeadline` column is still
 * required on every Notification row for schema simplicity, so a
 * declaration's is set equal to its publication date (no additional
 * window) rather than reusing the Section 11 day-count, which would imply
 * a right the statute doesn't grant at this stage.
 */
export const OBJECTION_WINDOW_DAYS_S19 = 0;

export function objectionWindowDays(type: NotificationType): number {
  return type === "PRELIMINARY_S11" ? OBJECTION_WINDOW_DAYS_S11 : OBJECTION_WINDOW_DAYS_S19;
}

export function defaultObjectionWindowDeadline(type: NotificationType, publicationDate: Date): Date {
  const deadline = new Date(publicationDate);
  deadline.setDate(deadline.getDate() + objectionWindowDays(type));
  return deadline;
}
