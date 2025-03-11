/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Analytics, AnalyticsDocument } from 'src/schemas/analytics.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Analytics.name) private analyticsModel: Model<AnalyticsDocument>,
  ) {}

  async getUserAnalytics(userId: string): Promise<{ apiCalls: number; projectsCreated: number; tablesCreated: number; tokensGenerated: number; failedApiCalls: number }> {
    let analytics = await this.analyticsModel.findOne({ userId }).exec();
    if (!analytics) {
      // Create default analytics record if none exists
      analytics = new this.analyticsModel({ userId });
      await analytics.save();
    }
    return {
      apiCalls: analytics.apiCalls,
      projectsCreated: analytics.projectsCreated,
      tablesCreated: analytics.tablesCreated,
      tokensGenerated: analytics.tokensGenerated,
      failedApiCalls: analytics.failedApiCalls,
    };
  }

  async incrementAnalytics(userId: string, field: keyof Analytics, amount: number = 1): Promise<void> {
    const analytics = await this.analyticsModel.findOne({ userId }).exec();
    if (!analytics) {
      const newAnalytics = new this.analyticsModel({ userId, [field]: amount });
      await newAnalytics.save();
    } else {
      await this.analyticsModel.updateOne(
        { userId },
        { $inc: { [field]: amount } },
      ).exec();
    }
  }

  async decrementAnalytics(userId: string, field: keyof Analytics, amount: number = 1): Promise<void> {
    const analytics = await this.analyticsModel.findOne({ userId }).exec();
    if (analytics) {
      const currentValue = analytics[field] as number;
      if (currentValue >= amount) {
        await this.analyticsModel.updateOne(
          { userId },
          { $inc: { [field]: -amount } },
        ).exec();
      }
    }
  }
}