/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { TokenModule } from './token/token.module';
import { TablesModule } from './tables/tables.module';


import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGO_URI!), ProjectsModule, TokenModule, TablesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
