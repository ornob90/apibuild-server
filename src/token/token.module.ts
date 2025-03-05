/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TokenService } from './token.service';
import { TokensController } from './token.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Token, TokenSchema } from 'src/schemas/token.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
  ],
  providers: [TokenService],
  controllers: [TokensController],
  exports: [TokenService],
})
export class TokenModule {}
