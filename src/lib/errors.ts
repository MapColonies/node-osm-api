import { AxiosError } from 'axios';

class HttpErrorHandler extends Error {
  public constructor(error: AxiosError) {
    super(error.response?.data as string);
    Object.setPrototypeOf(this, HttpErrorHandler.prototype);
  }
}

export class UnauthorizedError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class BadXmlError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, BadXmlError.prototype);
  }
}

export class ChangesetNotFoundError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, ChangesetNotFoundError.prototype);
  }
}

export class ChangesetOrDiffElementsNotFoundError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, ChangesetOrDiffElementsNotFoundError.prototype);
  }
}

export class ChangesetAlreadyClosedError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, ChangesetAlreadyClosedError.prototype);
  }
}

export class OwnerMismatchError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, OwnerMismatchError.prototype);
  }
}

export class NotAllowedError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, NotAllowedError.prototype);
  }
}

export class MismatchChangesetError extends HttpErrorHandler {
  public constructor(error: AxiosError) {
    super(error);
    Object.setPrototypeOf(this, MismatchChangesetError.prototype);
  }
}

export type ConflictErrorType = ChangesetAlreadyClosedError | MismatchChangesetError | ChangesetAlreadyClosedError | Error;
