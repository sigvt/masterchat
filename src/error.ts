export type ErrorCode =
  | "private" // Private video
  | "unavailable" // Deleted video OR wrong video id
  | "unarchived" // Live stream recording is not available
  | "disabled" // Live chat is disabled
  | "abandoned" // Abandoned stream
  | "membersOnly" // No permission (members-only)
  | "denied" // Access denied
  | "invalid" // Invalid request
  | "unknown"; // Unknown error

export class MasterchatError extends Error {
  public code: ErrorCode;

  constructor(code: ErrorCode, msg: string) {
    super(msg);
    this.code = code;

    Object.setPrototypeOf(this, MasterchatError.prototype);
  }
}
