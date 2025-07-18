/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { DailyAnalyticsController } from './daily-analytics.controller';
import { DailyAnalyticsService } from './daily-analytics.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  DailyAnalytics,
  DailyAnalyticsSchema,
} from 'src/schemas/daily-analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyAnalytics.name, schema: DailyAnalyticsSchema },
    ]),
  ],
  controllers: [DailyAnalyticsController],
  providers: [DailyAnalyticsService],
})
export class DailyAnalyticsModule {}
