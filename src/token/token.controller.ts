/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Delete,

  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { TokenService } from './token.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('tokens')
@UseGuards(AuthGuard)
export class TokensController {
  constructor(private readonly tokenService: TokenService) {}

  @Post()
  async createToken(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.tokenService.createToken(userId);
  }

  @Get()
  async getUserTokens(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.tokenService.getUserTokens(userId);
  }

  @Get(':tokenId')
  async getTokenById(
    @Req() req: AuthenticatedRequest,
    @Param('tokenId') tokenId: string,
  ) {
    const userId = req.user.id;
    return this.tokenService.getTokenById(userId, tokenId);
  }

  @Delete(':tokenId')
  async revokeToken(
    @Req() req: AuthenticatedRequest,
    @Param('tokenId') tokenId: string,
  ) {
    const userId = req.user.id;
    await this.tokenService.revokeToken(userId, tokenId);
    return { message: 'Token revoked successfully' };
  }
}
