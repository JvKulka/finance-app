import bcrypt from "bcryptjs";

/**
 * Hash a password using bcrypt
 * @param password Plain text password
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 * @param password Plain text password
 * @param hash Hashed password from database
 * @returns True if password matches, false otherwise
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) {
    return false;
  }
  return await bcrypt.compare(password, hash);
}

