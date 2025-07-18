/* eslint-disable prettier/prettier */
import { Controller, Get, Req } from '@nestjs/common';
import { DailyAnalyticsService } from './daily-analytics.service';
import { AuthenticateRequest } from 'src/types/auth.types';

@Controller('daily-analytics')
export class DailyAnalyticsController {
  constructor(private readonly dailyAnalyticsService: DailyAnalyticsService) {}

  @Get()
  async getDailyAnalytics(@Req() req: AuthenticateRequest) {
    const userId = req.user.id;
    return this.dailyAnalyticsService.getUserDailyAnalytics(userId);
  }

  // @Post()
  // async addCustomData() {
  //   return this.dailyAnalyticsService.addCustomData();
  // }
}
