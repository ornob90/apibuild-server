/* eslint-disable prettier/prettier */
import { Controller, Get, Req } from '@nestjs/common';
import { AuthenticateRequest } from 'src/types/auth.types';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('data')
  async getUserData(@Req() req: AuthenticateRequest) {
    const userId = req.user.id;
    return this.usersService.getUserData(userId);
  }
}
