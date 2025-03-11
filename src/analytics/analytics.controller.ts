/* eslint-disable prettier/prettier */
import { Controller, Get, Req } from '@nestjs/common';
// import { AuthGuard } from '../auth/guards/auth.guard';
import { AnalyticsService } from './analytics.service';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('analytics')
// @UseGuards(AuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get()
  async getUserAnalytics(@Req() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.analyticsService.getUserAnalytics(userId);
  }
}