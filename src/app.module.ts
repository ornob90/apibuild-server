/* eslint-disable prettier/prettier */
import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
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
import { AnalyticsModule } from './analytics/analytics.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { nodemailerConfig } from './config/nodemailer.config';
import { VerifyMiddleware } from './middlewares/verify.middleware';
import { ProjectsController } from './projects/projects.controller';
import { TablesController } from './tables/tables.controller';
dotenv.config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGO_URI!),
    CacheModule.register(),
    JwtModule.register(jwtConfig),
    MailerModule.forRoot(nodemailerConfig),
    ProjectsModule,
    TokenModule,
    TablesModule,
    ApisModule,
    ApiBuildModule,
    AuthModule,
    AnalyticsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifyMiddleware)
      .forRoutes(
        { path: '/auth/session', method: RequestMethod.GET },
        ProjectsController,
        TablesController
      );
  }
}
