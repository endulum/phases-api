import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AccountModule } from './modules/account/account.module';
import {
  InternalServerErrorExceptionFilter,
  NotFoundExceptionFilter,
  UnauthorizedExceptionFilter,
} from './shared/http-exception.filters';
import { PrismaModule } from './modules/prisma/prisma.module';

@Module({
  imports: [AccountModule, PrismaModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: NotFoundExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: InternalServerErrorExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: UnauthorizedExceptionFilter,
    },
  ],
})
export class AppModule {}
