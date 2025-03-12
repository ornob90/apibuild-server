/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserRegisterDto } from './dto/create-user-register.dto';
import { CreateUserVerifyDto } from './dto/create-user-verify.dto';
import { CreateUserLoginDto } from './dto/create-user-logn.dto';

import { CreateUserRefreshDto } from './dto/create-user-refresh.dto';
import { CreateUserForgotPasswordDto } from './dto/create-user-forgot-pass.dto';
import { CreateUserResetPasswordDto } from './dto/create-user-reset-pass.dto';
import { User } from 'src/schemas/user.schema';
import { VerifyRequest } from 'src/middlewares/verify.middleware';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('session')
  @UsePipes(new ValidationPipe())
  session(@Req() req: VerifyRequest) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const session = req.user;
    return this.authService.session(session);
  }

  @Post('register')
  @UsePipes(new ValidationPipe())
  register(
    @Body() createUserRegisterDto: CreateUserRegisterDto,
  ): Promise<User | { accessToken: string; refreshToken: string }> {
    return this.authService.register(createUserRegisterDto);
  }

  @Post('login')
  login(@Body() createUserLoginDto: CreateUserLoginDto) {
    return this.authService.login(createUserLoginDto);
  }

  @Post('logout')
  logout(@Req() req: VerifyRequest) {
    return this.authService.logout(req);
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe())
  forgotPassword(
    @Body() createUserForgotPasswordDto: CreateUserForgotPasswordDto,
  ) {
    return this.authService.forgotPassword(createUserForgotPasswordDto);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe())
  resetPassword(
    @Body() createUserResetPasswordDto: CreateUserResetPasswordDto,
  ) {
    return this.authService.resetPassword(createUserResetPasswordDto);
  }

  @Post('refresh')
  @UsePipes(new ValidationPipe())
  refresh(@Body() createUserRefreshDto: CreateUserRefreshDto) {
    return this.authService.refresh(createUserRefreshDto);
  }

  @Put('activate-account')
  activateAccount(@Body() createUserVerifyDto: CreateUserVerifyDto) {
    return this.authService.activateAccount(createUserVerifyDto);
  }
}
