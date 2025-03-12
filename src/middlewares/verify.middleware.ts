/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from 'src/token/token.service';
import { Session } from 'src/types/auth.types';
import { VerifiedRequestInterface } from 'src/types/middleware.types';

// Define the request interface with user property
export interface VerifyRequest extends Request {
  user: Session;
}

@Injectable()
export class VerifyMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tokenService: TokenService
  ) {}

  async use(req: VerifiedRequestInterface, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];

    // console.log("authHeader:", authHeader);

    // Check if Authorization header is present and starts with 'Bearer '
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];

    // Handle API token (starts with 'api_')
    if (token && token.startsWith('api_')) {
      const userId = await this.tokenService.validateToken(token);

      if (!userId) {
        throw new UnauthorizedException('Invalid API token');
      }

      // Attach user to request (assuming Session type needs id)
      req.user = { id: userId } as Session;
      return next();
    }

    // Handle JWT token
    try {
      const decoded = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'your-secret-key', // Ensure this matches your JWT config
      });

      if (!decoded || !decoded.id) {
        throw new UnauthorizedException('Invalid JWT or missing user ID');
      }

      // Attach decoded user data to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        userName: decoded.userName, // Adjust based on your JWT payload
      } as Session;

      next();
    } catch {
      throw new UnauthorizedException('Invalid JWT');
    }
  }
}