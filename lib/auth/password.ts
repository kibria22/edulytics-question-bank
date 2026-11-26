import bcrypt from 'bcryptjs';

const APP_PASSWORD = process.env.APP_PASSWORD || '';

export function isPasswordConfigured(): boolean {
  return APP_PASSWORD.length > 0;
}

export async function verifyPassword(password: string): Promise<boolean> {
  if (!isPasswordConfigured()) {
    return false;
  }
  
  // For simple comparison (not hashed in env)
  if (password === APP_PASSWORD) {
    return true;
  }
  
  // Try bcrypt comparison if env password is hashed
  try {
    return await bcrypt.compare(password, APP_PASSWORD);
  } catch {
    return false;
  }
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}
