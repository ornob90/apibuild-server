/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApisService } from './apis.service';
import { ApisController } from './apis.controller';
import { Api, ApiSchema } from 'src/schemas/api.schema';
import { Table, TableSchema } from 'src/schemas/table.schema';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Api.name, schema: ApiSchema },
      { name: Table.name, schema: TableSchema }, // Needed for table validation
    ]),
    TokenModule
  ],
  controllers: [ApisController],
  providers: [ApisService],
  exports: [ApisService], // Export for potential use in ApiBuild
})
export class ApisModule {}