import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';

export type NestApp = INestApplication<App>;
