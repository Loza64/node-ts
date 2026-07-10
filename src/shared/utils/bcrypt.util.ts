import bcrypt from 'bcryptjs';

export const encryptPass = (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePass = (password: string, encryptedPass: string): Promise<boolean> => {
  return bcrypt.compare(password, encryptedPass);
};
