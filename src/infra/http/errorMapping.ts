import {
  CannotStartTimerError,
  NoRunningTimeEntryError,
  TimeRangeInvalidError,
  TaskTemplateArchivedError,
  TaskTemplateNotFoundError,
  TimeEntryNotFoundError,
  CategoryConstraintError,
} from '../../core/domain/errors/domainErrors';

export type ErrorResponse = {
  status: number;
  code: string;
  message: string;
};

/**
 * Maps domain errors to HTTP-ish responses.
 * Intended for use in server actions / route handlers.
 */
export function mapDomainErrorToResponse(err: unknown): ErrorResponse | null {
  if (err instanceof CannotStartTimerError) {
    return { status: 409, code: err.code, message: err.message };
  }
  if (err instanceof NoRunningTimeEntryError) {
    return { status: 404, code: err.code, message: err.message };
  }
  if (err instanceof TimeRangeInvalidError) {
    return { status: 400, code: err.code, message: err.message };
  }
  if (err instanceof TaskTemplateArchivedError) {
    return { status: 409, code: err.code, message: err.message };
  }
  if (err instanceof TaskTemplateNotFoundError) {
    return { status: 404, code: err.code, message: err.message };
  }
  if (err instanceof TimeEntryNotFoundError) {
    return { status: 404, code: err.code, message: err.message };
  }
  if (err instanceof CategoryConstraintError) {
    return { status: 400, code: err.code, message: err.message };
  }
  return null;
}
