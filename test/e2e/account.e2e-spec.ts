import { req } from 'test/helpers/req.helper';
import { expectPayload } from 'test/helpers/expectPayload';
import { expectFieldErrors } from 'test/helpers/expectFieldErrors';

import { signupSuccessSchema } from 'src/modules/account/payloads/signup-success.schema';
import { loginSuccessSchema } from 'src/modules/account/payloads/login-success.schema';
import { getSchema } from 'src/modules/account/payloads/get-account.schema';
import { updateSuccessSchema } from 'src/modules/account/payloads/update-success.schema';

enum Routes {
  Signup = 'POST /account/signup',
  Login = 'POST /account/login',
  GetAccount = 'GET /account',
  UpdateAccount = 'PATCH /account',
}

afterAll(async () => {
  await prisma.clear();
});

describe(Routes.Signup, () => {
  const correctForm = {
    username: 'bob',
    password: 'correct horse battery staple',
    confirmPassword: 'correct horse battery staple',
  };

  beforeAll(async () => {
    await prisma.clear();
  });

  it('400 if input errors', async () => {
    await expectFieldErrors({
      callback: async (form) => {
        return await req(app, Routes.Signup, { form });
      },
      correctForm,
      wrongFields: [
        { username: '' },
        { username: 'a' },
        { username: Array(100).fill('A').join('') },
        { username: '@@@@' },
        { password: '' },
        { password: 'horse' },
        { confirmPassword: '' },
        { confirmPassword: 'incorrect horse battery staple' },
      ],
    });
  });

  it('400 if username is not unique', async () => {
    const existingUser = await prisma.createUser({
      username: 'alice',
      password: 'correct horse battery staple',
    });
    const res = await req(app, Routes.Signup, {
      form: { ...correctForm, username: existingUser.username },
    });
    expectPayload(res, {
      status: 400,
      message: 'Usernames must be unique. Please choose another.',
    });
  });

  it('201 with data', async () => {
    const res = await req(app, Routes.Signup, { form: correctForm });
    const payload = expectPayload(res, {
      status: 201,
      message: 'Account successfully created.',
      schema: signupSuccessSchema,
    });
    expect(payload.data.newUser.username).toBe(correctForm.username);
  });
});

describe(Routes.Login, () => {
  const correctForm = {
    username: 'bob',
    password: 'correct horse battery staple',
  };

  beforeAll(async () => {
    await prisma.clear();
    await prisma.createUser(correctForm);
  });

  it('400 if input errors', async () => {
    await expectFieldErrors({
      callback: async (form) => {
        return await req(app, Routes.Login, { form });
      },
      correctForm,
      wrongFields: [{ username: '' }, { password: '' }],
    });
  });

  it('400 if unknown username', async () => {
    const res = await req(app, Routes.Login, {
      form: { ...correctForm, username: 'alice' },
    });
    expectPayload(res, {
      status: 400,
      message: 'Incorrect username or password.',
    });
  });

  it('400 if wrong password', async () => {
    const res = await req(app, Routes.Login, {
      form: { ...correctForm, password: 'incorrect horse battery staple' },
    });
    expectPayload(res, {
      status: 400,
      message: 'Incorrect username or password.',
    });
  });

  it('201 with data', async () => {
    const res = await req(app, Routes.Login, { form: correctForm });
    expectPayload(res, {
      status: 201,
      message: 'Successfully logged in.',
      schema: loginSuccessSchema,
    });
  });
});

describe(Routes.GetAccount, () => {
  const loginForm = {
    username: 'bob',
    password: 'correct horse battery staple',
  };
  let token: string;

  beforeAll(async () => {
    await prisma.clear();
    const user = await prisma.createUser(loginForm);
    token = await jwt.signAsync({ id: user.id, username: user.username });
  });

  it('401 if no token', async () => {
    const res = await req(app, Routes.GetAccount);
    expectPayload(res, {
      status: 401,
      message: 'Please log in.',
    });
  });

  it('200 if given token', async () => {
    const res = await req(app, Routes.GetAccount, { token });
    expectPayload(res, {
      status: 200,
      schema: getSchema,
    });
  });
});

describe(Routes.UpdateAccount, () => {
  const correctForm = {
    username: 'alice',
    password: 'staple battery horse correct',
    confirmPassword: 'staple battery horse correct',
    currentPassword: 'correct horse battery staple',
  };
  let token: string;

  beforeAll(async () => {
    await prisma.clear();
    const user = await prisma.createUser({
      username: 'bob',
      password: correctForm.currentPassword,
    });
    token = await jwt.signAsync({ id: user.id, username: user.username });
  });

  it('400 if input errors', async () => {
    await expectFieldErrors({
      callback: async (form) => {
        return await req(app, Routes.UpdateAccount, { token, form });
      },
      correctForm,
      wrongFields: [
        { username: '' },
        { confirmPassword: '' },
        { currentPassword: '' },
        { username: 'a' },
        { username: '&&&&' },
        { password: '' },
        { password: '.' },
      ],
    });
  });

  it('400 if username is not unique', async () => {
    const otherUser = await prisma.createUser({
      username: 'eve',
      password: 'password',
    });
    const incorrectForm = { ...correctForm, username: otherUser.username };
    const res = await req(app, Routes.UpdateAccount, {
      token,
      form: { ...incorrectForm },
    });
    expectPayload(res, {
      status: 400,
      message: 'Usernames must be unique. Please choose another.',
    });
    await prisma.user.delete({ where: { id: otherUser.id } });
  });

  it('400 if incorrect password', async () => {
    const res = await req(app, Routes.UpdateAccount, {
      token,
      form: {
        ...correctForm,
        currentPassword: 'incorrect horse battery staple',
      },
    });
    expectPayload(res, {
      status: 400,
      message: 'Incorrect password.',
    });
  });

  it('200 with data', async () => {
    let res = await req(app, Routes.UpdateAccount, {
      token,
      form: correctForm,
    });
    const payload = expectPayload(res, {
      status: 200,
      message: 'Account successfully updated.',
      schema: updateSuccessSchema,
    });
    expect(payload.data.updatedUser.username).toEqual(correctForm.username);
    expect(payload.data.updatedPassword).toBe(true);

    // can log in with new password afterward
    res = await req(app, Routes.Login, {
      form: {
        username: correctForm.username,
        password: correctForm.password,
      },
    });
    expectPayload(res, {
      status: 201,
      message: 'Successfully logged in.',
    });
  });

  it('200 even without password', async () => {
    const username = 'eve';
    let res = await req(app, Routes.UpdateAccount, {
      token,
      form: { username },
    });
    const payload = expectPayload(res, {
      status: 200,
      message: 'Account successfully updated.',
      schema: updateSuccessSchema,
    });
    expect(payload.data.updatedUser.username).toEqual(username);
    expect(payload.data.updatedPassword).toBe(false);

    // can log in with same password
    res = await req(app, Routes.Login, {
      form: {
        username,
        password: correctForm.password,
      },
    });
    expectPayload(res, {
      status: 201,
      message: 'Successfully logged in.',
    });
  });
});
