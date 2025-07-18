/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable no-case-declarations */

import {
  Controller,
  All,
  Req,
  Res,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { ApiBuildService } from './api-build.service';
import { Response } from 'express';
import { AuthenticateRequest } from 'src/types/auth.types';

@Controller('api-build')
export class ApiBuildController {
  constructor(private readonly apiBuildService: ApiBuildService) {}

  @All('*')
  async handleApiRequest(
    @Req() req: AuthenticateRequest,
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    const method = req.method;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const path = req.path.replace(/^\/api-build/, ''); // Strip /api-build prefix
    const body = req.body;

    try {
      const result = await this.apiBuildService.executeApi(
        userId,
        method,
        path,
        body,
      );
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(404).json({ message: error.message });
      } else if (error instanceof BadRequestException) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal server error' });
      }
    }
  }
}
