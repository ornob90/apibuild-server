/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Req,
  Patch,
  Body,
} from '@nestjs/common';
import { TokenService } from './token.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('tokens')
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

  @Patch(':tokenId/activation')
  async updateTokenActivation(
    @Req() req: AuthenticatedRequest,
    @Param('tokenId') tokenId: string,
    @Body('isActive') isActive: boolean,
  ) {
    const userId = req.user.id;
    return this.tokenService.updateTokenActivation(userId, tokenId, isActive);
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
