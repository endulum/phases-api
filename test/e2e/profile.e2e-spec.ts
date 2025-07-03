enum Routes {
  GetProfile = 'GET /profile',
  CreateProfile = 'POST /profile',
  UpdateProfile = 'PATCH /profile',
}

describe(Routes.GetProfile, () => {
  // clear db
  // add one user, no profile
  test("403 if doesn't have profile", async () => {});
  // give user a profile
  test('200 with data', async () => {});
});

describe(Routes.CreateProfile, () => {
  // clear db
  // add one user
  test('403 if has profile', async () => {
    // add temp user
    // give temp user a profile
    // delete temp user
  });
  test('400 if input errors', async () => {});
  test('201 with data', async () => {});
});

describe(Routes.UpdateProfile, () => {
  // clear db
  // add one user
  test("403 if doesn't have profile", async () => {});
  // give user a profile
  test('400 if input errors', async () => {});
  test('200 with data', async () => {});
});
