/* eslint-disable prettier/prettier */
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';
import { Session } from 'src/types/auth.types';
import { VerifiedRequestInterface } from 'src/types/middleware.types';


export interface VerifyRequest extends Request {
  user: Session;
}

@Injectable()
export class VerifyMiddleware implements NestMiddleware {
  use(req: VerifiedRequestInterface, res: Response, next: NextFunction) {
    const decoded = {
      _id: '66d5e8babb3a271cf394f8d3',
      displayName: 'Kazi Towfiq',
      email: 'ornonornob@gmail.com',
    };
    req.user = decoded;
    next();
  }
}
