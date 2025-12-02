/**
 * Domain-level errors for time tracking rules.
 */
export class CannotStartTimerError extends Error {
  readonly code = 'CANNOT_START_TIMER';
  constructor(message = 'Cannot start a new timer while another is running.') {
    super(message);
    this.name = 'CannotStartTimerError';
  }
}

export class NoRunningTimeEntryError extends Error {
  readonly code = 'NO_RUNNING_TIME_ENTRY';
  constructor(message = 'No running time entry found.') {
    super(message);
    this.name = 'NoRunningTimeEntryError';
  }
}

export class TimeRangeInvalidError extends Error {
  readonly code = 'TIME_RANGE_INVALID';
  constructor(message = 'The provided time range is invalid.') {
    super(message);
    this.name = 'TimeRangeInvalidError';
  }
}

export class TaskTemplateArchivedError extends Error {
  readonly code = 'TASK_TEMPLATE_ARCHIVED';
  constructor(message = 'The task template is archived and cannot be used.') {
    super(message);
    this.name = 'TaskTemplateArchivedError';
  }
}

export class TaskTemplateNotFoundError extends Error {
  readonly code = 'TASK_TEMPLATE_NOT_FOUND';
  constructor(message = 'Task template not found for user.') {
    super(message);
    this.name = 'TaskTemplateNotFoundError';
  }
}

export class TimeEntryNotFoundError extends Error {
  readonly code = 'TIME_ENTRY_NOT_FOUND';
  constructor(message = 'Time entry not found for user.') {
    super(message);
    this.name = 'TimeEntryNotFoundError';
  }
}

export class CategoryConstraintError extends Error {
  readonly code = 'CATEGORY_CONSTRAINT';
  constructor(message = 'Category assignment violates constraints.') {
    super(message);
    this.name = 'CategoryConstraintError';
  }
}
