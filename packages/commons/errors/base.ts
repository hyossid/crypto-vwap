export class NamedError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class NetworkError extends NamedError {}

export class RethrownError<T extends Error = Error> extends NamedError {
  constructor(public reason: T, message?: string) {
    super(message || reason.message);
    this.stack = this.stack + '\n' + reason.stack;
  }
}
