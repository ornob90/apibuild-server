/* eslint-disable prettier/prettier */
import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getResponse()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Internal Server Error';

    let errorResponse = {
      acknowledgement: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
    };

    if (typeof message === 'string') {
      errorResponse.message = message;
    } else {
      errorResponse = {
        ...errorResponse,
        ...message,
      };
    }
  }
}
