import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, firstValueFrom, isObservable } from 'rxjs';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const result = super.canActivate(context);
      if (isObservable(result)) {
        await firstValueFrom(result);
      } else if (result instanceof Promise) {
        await result;
      }
    } catch {
      // no token or invalid — allow anonymous
    }
    return true;
  }

  handleRequest<T>(_err: Error | null, user: T | false): T | null {
    return user || null;
  }
}
