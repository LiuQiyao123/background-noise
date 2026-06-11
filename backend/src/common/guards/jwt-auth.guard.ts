import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<T>(err: Error | null, user: T | false): T {
    if (err || !user) {
      throw err ?? new UnauthorizedException('未登录或令牌无效');
    }
    return user;
  }
}
