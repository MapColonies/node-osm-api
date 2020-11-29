import { AxiosError } from "axios";

class HttpErrorHandler extends Error {
    public constructor(error: AxiosError) {
        super(error.response?.data);
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

export class InternalServerError extends HttpErrorHandler {
    public constructor(error: AxiosError) {
        super(error);
        Object.setPrototypeOf(this, InternalServerError.prototype);
    }
}