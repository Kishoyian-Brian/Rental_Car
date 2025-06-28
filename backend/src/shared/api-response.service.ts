import { Injectable } from '@nestjs/common';

@Injectable()
export class ApiResponseService {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  ok<T>(data: T, message = 'Success', redirectUrl?: string, extraData?: any) {
    return {
      statusCode: 200,
      message,
      data,
      redirectUrl,
      extraData,
      timestamp: this.getTimestamp(),
    };
  }

  created<T>(data: T, message = 'Created') {
    return {
      statusCode: 201,
      message,
      data,
      timestamp: this.getTimestamp(),
    };
  }

  badRequest(message = 'Bad Request', error?: string) {
    return {
      statusCode: 400,
      message,
      error,
      timestamp: this.getTimestamp(),
    };
  }

  unauthorized(message = 'Unauthorized', error?: string) {
    return {
      statusCode: 401,
      message,
      error,
      timestamp: this.getTimestamp(),
    };
  }

  notFound(message = 'Not Found', error?: string) {
    return {
      statusCode: 404,
      message,
      error,
      timestamp: this.getTimestamp(),
    };
  }

  error(message = 'Internal Server Error', statusCode = 500, error?: string) {
    return {
      statusCode,
      message,
      error,
      timestamp: this.getTimestamp(),
    };
  }

  okRequestReset<T>(data: T, message = 'Password reset requested', redirectUrl?: string, extraData?: any) {
    return {
      statusCode: 200,
      message,
      data,
      redirectUrl,
      extraData,
      timestamp: this.getTimestamp(),
    };
  }
}
