import { ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class InputGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    if (!request.query.ticker) {
      return false;
    }

    return true;
  }
}
