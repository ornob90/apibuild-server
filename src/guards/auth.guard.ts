/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';
import { AuthGuard as JwtAuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    console.log("authHeader", authHeader)

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Authorization header missing or invalid',
      );
    }

    const token = authHeader.split(' ')[1];

    // check if it's an API token (starts with 'api_')
    if (token && token.startsWith('api_')) {
      const userId = await this.tokenService.validateToken(token);

      if (!userId) {
        throw new UnauthorizedException('Invalid API token');
      }

      request.user = { id: userId };
      return true;
    }

    // Fall back to JWT authentcation
    const jwtGuard = new (JwtAuthGuard('jwt'))();
    const jwtResult = await jwtGuard.canActivate(context);

    if (!jwtResult) {
      throw new UnauthorizedException('Invalid JWT');
    }

    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('User ID is not found in JWT');
    }

    return true;
  }
}
