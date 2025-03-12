/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class SuccessResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    // const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const statusCode = response.status || 200;

    return next.handle().pipe(
      map((data) => {
        if (data === undefined) {
          return undefined;
        }

        return {
          acknowledgement: true,
          statusCode: statusCode,
          timestamp: new Date().toISOString(),
        //   path: request.url,
          data: data || null, // Include the original response data
        };
      }),
    );
  }
}
