import * as bcrypt from 'bcrypt';

export async function comparePasswords(
  userPassword: string,
  inputPassword: string,
) {
  const match = await bcrypt.compare(inputPassword, userPassword);
  return match;
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
