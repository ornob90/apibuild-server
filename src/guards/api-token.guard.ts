/* eslint-disable prettier/prettier */
 /* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (
      !authHeader ||
      typeof authHeader !== 'string' ||
      !authHeader.startsWith('Bearer api_')
    ) {
      throw new UnauthorizedException('Missing or Invalid Token');
    }

    const token = authHeader.split(' ')[1];

    const userId = await this.tokenService.validateToken(token);

    if (!userId) {
      throw new UnauthorizedException('Invalid Token');
    }

    request.user = { id: userId };

    return true;
  }
}
