/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Analytics, AnalyticsSchema } from 'src/schemas/analytics.schema';
import { DailyAnalytics, DailyAnalyticsSchema } from 'src/schemas/daily-analytics.schema';
import { DailyAnalyticsService } from 'src/daily-analytics/daily-analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Analytics.name, schema: AnalyticsSchema },
      { name: DailyAnalytics.name, schema: DailyAnalyticsSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, DailyAnalyticsService],
})
export class AnalyticsModule {}
