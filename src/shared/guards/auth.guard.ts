import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AccountService } from 'src/modules/account/account.service';

type Payload = { id: number; username: string };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private accountService: AccountService,
  ) {}

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private async extractPayloadFromToken(
    token: string,
  ): Promise<Payload | null> {
    try {
      const payload: Payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      return payload;
    } catch {
      return null;
    }
  }

  private async findUserFromPayload(payload: Payload) {
    return await this.accountService.findById(payload.id);
  }

  async canActivate(context: ExecutionContext) {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);
    if (!token) throw new UnauthorizedException();

    const payload = await this.extractPayloadFromToken(token);
    if (!payload) throw new UnauthorizedException();

    const user = await this.findUserFromPayload(payload);
    if (!user) throw new UnauthorizedException();

    request['user'] = user;
    return true;
  }
}
