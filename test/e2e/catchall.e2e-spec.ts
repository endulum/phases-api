import { req } from '../helpers/req.helper';
import { expectPayload } from 'test/helpers/expectPayload';

describe('catchall', () => {
  it('404', async () => {
    const url = '/owo';
    const res = await req(app, `GET ${url}`);
    expectPayload(res, {
      status: 404,
      message: `Nothing found at ${url}`,
    });
  });
});
