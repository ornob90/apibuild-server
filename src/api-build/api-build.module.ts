/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiBuildService } from './api-build.service';
import { ApiBuildController } from './api-build.controller';
import { Api, ApiSchema } from 'src/schemas/api.schema';
import { Table, TableSchema } from 'src/schemas/table.schema';
import { TokenModule } from 'src/token/token.module';
import { Analytics, AnalyticsSchema } from 'src/schemas/analytics.schema';
import { AnalyticsService } from 'src/analytics/analytics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Api.name, schema: ApiSchema },
      { name: Table.name, schema: TableSchema },
      { name: Analytics.name, schema: AnalyticsSchema },
    ]),
    TokenModule,
    AnalyticsService,
  ],
  controllers: [ApiBuildController],
  providers: [ApiBuildService],
})
export class ApiBuildModule {}
