/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable prettier/prettier */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from 'src/schemas/token.schema';
import { CreateTokenDto } from './dto/create-token.dto';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async createToken(
    userId: string,
    createTokenDto: CreateTokenDto,
  ): Promise<{ tokenId: string; token: string }> {
    const { name } = createTokenDto;

    // Generate a unique token
    const token = `api_${crypto.randomBytes(32).toString('hex')}`; // e.g., api_1a2b3c...
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const tokenHash = (await bcrypt.hash(token, 10)) as string;

    // Create the token document
    const tokenDoc = new this.tokenModel({
      userId,
      tokenHash,
      name,
      active: true,
    });

    await tokenDoc.save();

    return { tokenId: tokenDoc._id.toString(), token }; // Return plaintext token once
  }

  async getUserTokens(
    userId: string,
  ): Promise<
    { tokenId: string; name: string; createdAt: Date; active: boolean }[]
  > {
    const tokens = await this.tokenModel.find({ userId, active: true }).exec();
    return tokens.map((token) => ({
      tokenId: token._id.toString(),
      name: token.name,
      createdAt: token.createdAt,
      active: token.active,
    }));
  }

  async getTokenById(
    userId: string,
    tokenId: string,
  ): Promise<{
    tokenId: string;
    name: string;
    createdAt: Date;
    active: boolean;
  }> {
    const token = await this.tokenModel
      .findOne({ _id: tokenId, userId })
      .exec();
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    return {
      tokenId: token._id.toString(),
      name: token.name,
      createdAt: token.createdAt,
      active: token.active,
    };
  }

  async revokeToken(userId: string, tokenId: string): Promise<void> {
    const token = await this.tokenModel
      .findOne({ _id: tokenId, userId })
      .exec();
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    token.active = false;
    await token.save();
  }

  async validateToken(token: string): Promise<string | null> {
    const tokens = await this.tokenModel.find({ active: true }).exec();

    for (const tokenDoc of tokens) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const isCorrect = await bcrypt.compare(token, tokenDoc.tokenHash);

      if (isCorrect) {
        return tokenDoc.userId.toString();
      }
    }
    return null;
  }
}
