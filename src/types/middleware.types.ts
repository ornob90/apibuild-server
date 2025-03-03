/* eslint-disable prettier/prettier */
export interface CustomErrorException {
  acknowledgement: false;
  statusCode: number;
  timestamp: string;
  message: string | object;
}
