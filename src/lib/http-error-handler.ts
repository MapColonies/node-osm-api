export interface MyError extends Error { 
    response: { data: string, status: number };
}

class HttpErrorHandler extends Error {
    status: number

    constructor(error: MyError) {
        super(error.response.data);
        this.status = error.response.status;
        Object.setPrototypeOf(this, HttpErrorHandler.prototype);
    }
}

export default HttpErrorHandler;