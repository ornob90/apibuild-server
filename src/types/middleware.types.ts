/* eslint-disable prettier/prettier */
import { Payload } from './auth.types';

export interface VerifiedRequestInterface extends Request {
  user: Payload;
}

export interface CustomResponseInterface {
  acknowledgement: boolean;
  statusCode?: number;
  timestamp: string;
}

export interface CustomSuccessResponse extends CustomResponseInterface {
  data?: object | string;
}

export interface CustomErrorResponse extends CustomResponseInterface {
  message?: string | object;
}
