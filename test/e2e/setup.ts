import { createTestApp } from '../helpers/app';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { type NestApp } from '../helpers/types';
import { JwtService } from '@nestjs/jwt';

let nestApp: NestApp;

beforeAll(async () => {
  nestApp = await createTestApp();
  globalThis.app = nestApp.getHttpServer();
  globalThis.prisma = nestApp.get<PrismaService>(PrismaService);
  globalThis.jwt = nestApp.get<JwtService>(JwtService);
  await globalThis.prisma.clear();
});

afterAll(async () => {
  await nestApp.close();
});
