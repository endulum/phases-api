import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from 'src/app.module';
import { type NestApp } from './types';

export async function createTestApp(): Promise<NestApp> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  await app.init();
  return app;
}
