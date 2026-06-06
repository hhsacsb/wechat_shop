import { Catch, HttpException, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const message = exception.message;
      response.status(status).json({
        code: this.mapToBusinessCode(status),
        message,
        data: null,
      });
    } else {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        code: 50001,
        message: '系统内部错误',
        data: null,
      });
    }
  }

  private mapToBusinessCode(httpStatus: number): number {
    switch (httpStatus) {
      case HttpStatus.UNAUTHORIZED:
        return 40101;
      case HttpStatus.FORBIDDEN:
        return 40102;
      case HttpStatus.NOT_FOUND:
        return 40401;
      case HttpStatus.BAD_REQUEST:
        return 40001;
      case HttpStatus.CONFLICT:
        return 40901;
      default:
        return 50001;
    }
  }
}
