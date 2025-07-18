/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-base-to-string */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Token, TokenDocument } from 'src/schemas/token.schema';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TokenService {
  constructor(
    @InjectModel(Token.name) private tokenModel: Model<TokenDocument>,
  ) {}

  async createToken(userId: string): Promise<[]> {
    // Generate a unique token
    const token = `api_${crypto.randomBytes(32).toString('hex')}`; // e.g., api_1a2b3c...
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const tokenHash = (await bcrypt.hash(token, 10)) as string;

    // Create the token document
    const tokenDoc = new this.tokenModel({
      userId,
      tokenHash,
      token,
      active: true,
    });

    await tokenDoc.save();

    return [];
  }

  async getUserTokens(
    userId: string,
  ): Promise<{ _id: string; token: string; active: boolean }[]> {
    const tokens = await this.tokenModel.find({ userId }).exec();
    return tokens.map((token) => ({
      _id: token._id.toString(),
      token: token.token,
      active: token.active,
    }));
  }

  async getTokenById(
    userId: string,
    tokenId: string,
  ): Promise<{
    _id: string;
    createdAt: Date;
    token: string;
    active: boolean;
  }> {
    const token = await this.tokenModel
      .findOne({ _id: tokenId, userId })
      .exec();
    if (!token) {
      throw new NotFoundException('Token not found');
    }
    return {
      _id: token._id.toString(),
      createdAt: token.createdAt,
      token: token.tokenHash,
      active: token.active,
    };
  }

  async updateTokenActivation(
    userId: string,
    tokenId: string,
    isActive: boolean,
  ): Promise<{ tokenId: string; isActive: boolean }> {
    
    const token = await this.tokenModel
      .findOne({ _id: tokenId, userId })
      .exec();
    if (!token) {
      throw new NotFoundException('Token not found');
    }

    token.active = isActive;
    await token.save();

    return { tokenId: token._id.toString(), isActive: token.active };
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
