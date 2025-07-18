/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DailyAnalytics, DailyAnalyticsDocument } from 'src/schemas/daily-analytics.schema';

@Injectable()
export class DailyAnalyticsService {
  constructor(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    @InjectModel(DailyAnalytics.name) private dailyAnalyticsModel: Model<DailyAnalyticsDocument>,
  ) {}

  async incrementDailyAnalytics(
    userId: string,
    field: 'apiCalls' | 'projectsCreated' | 'tablesCreated' | 'tokensGenerated' | 'failedApiCalls',
  ): Promise<void> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of the day

    await this.dailyAnalyticsModel.updateOne(
      { userId, date: today },
      { $inc: { [field]: 1 } },
      { upsert: true },
    );
  }

  async getUserDailyAnalytics(
    userId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<
    {
      date: Date;
      apiCalls: number;
      projectsCreated: number;
      tablesCreated: number;
      tokensGenerated: number;
      failedApiCalls: number;
    }[]
  > {
    const query: any = { userId };
    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await this.dailyAnalyticsModel.find(query).sort({ date: 1 }).exec();

    return records.map((record) => ({
      date: record.date,
      apiCalls: record.apiCalls,
      projectsCreated: record.projectsCreated,
      tablesCreated: record.tablesCreated,
      tokensGenerated: record.tokensGenerated,
      failedApiCalls: record.failedApiCalls,
    }));
  }

  // async addCustomData() {
  //   const data = [
  //     {
  //       "userId": "67d1a19a4a48b0ab2018533b",
  //       "date": "2025-03-16T00:00:00.000Z",
  //       "apiCalls": 15,
  //       "projectsCreated": 1,
  //       "tablesCreated": 2,
  //       "tokensGenerated": 0,
  //       "failedApiCalls": 3
  //     },
  //     {
  //       "userId": "67d1a19a4a48b0ab2018533b",
  //       "date": "2025-03-17T00:00:00.000Z",
  //       "apiCalls": 8,
  //       "projectsCreated": 0,
  //       "tablesCreated": 1,
  //       "tokensGenerated": 1,
  //       "failedApiCalls": 0
  //     },
  //     {
  //       "userId": "67d1a19a4a48b0ab2018533b",
  //       "date": "2025-03-18T00:00:00.000Z",
  //       "apiCalls": 20,
  //       "projectsCreated": 0,
  //       "tablesCreated": 0,
  //       "tokensGenerated": 2,
  //       "failedApiCalls": 5
  //     },
  //     {
  //       "userId": "67d1a19a4a48b0ab2018533b",
  //       "date": "2025-03-19T00:00:00.000Z",
  //       "apiCalls": 12,
  //       "projectsCreated": 1,
  //       "tablesCreated": 0,
  //       "tokensGenerated": 0,
  //       "failedApiCalls": 1
  //     },
  //     {
  //       "userId": "67d1a19a4a48b0ab2018533b",
  //       "date": "2025-03-20T00:00:00.000Z",
  //       "apiCalls": 25,
  //       "projectsCreated": 0,
  //       "tablesCreated": 3,
  //       "tokensGenerated": 1,
  //       "failedApiCalls": 2
  //     }
  //   ]

  //   const response = await this.dailyAnalyticsModel.insertMany(data);
  //   return response;
  // }
}