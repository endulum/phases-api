import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  NotFoundException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch(NotFoundException)
export class NotFoundExceptionFilter implements ExceptionFilter {
  catch(exception: NotFoundException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    response.status(404).json({
      message: `Nothing found at ${request.url}`,
    });
  }
}

@Catch(InternalServerErrorException)
export class InternalServerErrorExceptionFilter implements ExceptionFilter {
  catch(exception: InternalServerErrorException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(500).json({
      message: 'Sorry, something went wrong when handling your request.',
    });
  }
}

@Catch(UnauthorizedException)
export class UnauthorizedExceptionFilter implements ExceptionFilter {
  catch(exception: UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(401).json({
      message: 'Please log in.',
    });
  }
}

// todo: improper json, server error, etc triggers a default error
