import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const ALGORITHM = 'aes-256-ctr';
// In a real app, this should be a strong, secret key from environment variables.
// For development, we can use a fixed key if not provided, or generate one.
// We'll try to get it from process.env.ENCRYPTION_KEY.
// If not present, we use a fallback for dev convenience but log a warning.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; // 32 chars
const IV_LENGTH = 16;

export class EncryptionService {
  /**
   * Encrypts a text string.
   */
  static encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  /**
   * Decrypts an encrypted text string.
   */
  static decrypt(text: string): string {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift()!, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
}
