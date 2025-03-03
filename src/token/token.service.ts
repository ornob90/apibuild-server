import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from '../schemas/token.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(@InjectModel(Token.name) private tokenModel: Model<TokenDocument>) {}

  async validateToken(token: string): Promise<string | null> {
    const tokens = await this.tokenModel.find({ active: true }).exec();
    for (const tokenDoc of tokens) {
      if (await bcrypt.compare(token, tokenDoc.tokenHash)) {
        return tokenDoc.userId.toString();
      }
    }
    return null;
  }

}