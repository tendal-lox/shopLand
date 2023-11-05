import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Response {
  message: string;
  success: boolean;
  result: any;
  timeStamps: Date;
  statusCode: number;
  path: string;
  error: null;
}
export class TransformationInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response> {
    const ctx = context.switchToHttp();
    const statusCode = ctx.getResponse().statusCode;
    const path = ctx.getRequest().url;
    return next.handle().pipe(
      map((data) => ({
        message: data.message,
        success: data.success,
        result: data.result,
        timeStamps: new Date(),
        statusCode,
        path,
        error: null,
      })),
    );
  }
}
