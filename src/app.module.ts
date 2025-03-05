/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsModule } from './projects/projects.module';
import { TokenModule } from './token/token.module';
import { TablesModule } from './tables/tables.module';
import { ApiBuildModule } from './api-build/api-build.module';
import { ApisModule } from './apis/apis.module';
import { AuthModule } from './auth/auth.module';

import * as dotenv from 'dotenv';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import { jwtConfig } from './config/jwt.config';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    CacheModule.register(),
    JwtModule.register(jwtConfig),
    ProjectsModule,
    TokenModule,
    TablesModule,
    ApisModule,
    ApiBuildModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
