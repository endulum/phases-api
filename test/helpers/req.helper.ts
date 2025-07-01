import * as request from 'supertest';
import { App } from 'supertest/types';

export async function req(
  app: App,
  endpoint: string,
  options?: {
    form?: Record<string, unknown>;
    token?: string;
  },
): Promise<request.Response> {
  const [method, url] = endpoint.split(' ');
  const Authorization = options?.token ? `Bearer ${options.token}` : '';
  const form = options?.form ?? {};

  switch (method) {
    case 'POST':
      return request(app)
        .post(url)
        .set({ Authorization })
        .type('form')
        .send(form);
    case 'PATCH':
      return request(app)
        .patch(url)
        .set({ Authorization })
        .type('form')
        .send(form);
    case 'DELETE':
      return request(app).delete(url).set({ Authorization });
    default:
      return request(app).get(url).set({ Authorization });
  }
}
