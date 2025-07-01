import { App } from 'supertest/types';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

declare global {
  var app: App;
  var prisma: PrismaService;
  var jwt: JwtService;
}
