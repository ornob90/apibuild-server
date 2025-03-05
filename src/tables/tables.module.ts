import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { Table, TableSchema } from 'src/schemas/table.schema';
import { Column, ColumnSchema } from 'src/schemas/column.schema';
import { TokenModule } from 'src/token/token.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Table.name, schema: TableSchema },
      { name: Column.name, schema: ColumnSchema },
    ]),
    TokenModule,
  ],
  controllers: [TablesController],
  providers: [TablesService],
  exports: [TablesService], // Export for use in Apis and ApiBuild
})
export class TablesModule {}
