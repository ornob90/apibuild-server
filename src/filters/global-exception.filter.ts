/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<any>(); // Type as any for simplicity; refine as needed
    // const request = ctx.getRequest<Request>();

    // Determine the status code
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Determine the message
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal Server Error';

    // Base error response structure
    let errorResponse: any = {
      acknowledgement: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      // path: request.url, // Include the request path for debugging
    };

    // Handle message based on its type
    if (typeof message === 'string') {
      errorResponse.message = message;
    } else if (typeof message === 'object') {
      errorResponse = {
        ...errorResponse,
        ...message, // Spread object properties (e.g., from BadRequestException)
      };
    }

    // Send the response to the client
    response.status(status).json(errorResponse);
  }
}
