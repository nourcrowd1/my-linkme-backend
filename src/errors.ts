export class HTTPError extends Error {
  constructor(public statusCode: number, message: string, extra?: any) {
    super(message);
    this.statusCode = statusCode;
    if (typeof extra === "object") Object.assign(this, extra);
  }
}
export class InputError extends HTTPError {
  constructor(public field: string, public reason?: string) {
    super(400, `${field}.${reason ?? "incorrect"}`);
  }
}

export class NotFoundError extends HTTPError {
  constructor(public entity: string, message?: string) {
    super(404, `${entity}.${message ?? "not_found"}`);
  }
}

export class NotAuthorizedError extends HTTPError {
  constructor(message?: string) {
    super(403, message ?? "access_denied");
  }
}
