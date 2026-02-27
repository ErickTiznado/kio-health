import { Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV recommended for GCM
const AUTH_TAG_LENGTH = 16;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
if (!ENCRYPTION_KEY) {
  throw new Error('ENCRYPTION_KEY environment variable is required.');
}
if (!/^[0-9a-fA-F]{64}$/.test(ENCRYPTION_KEY)) {
  throw new Error(
    'ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
      'Generate one with: node -e "require(\'crypto\').randomBytes(32).toString(\'hex\')"',
  );
}
const keyBuffer = Buffer.from(ENCRYPTION_KEY, 'hex');

@Injectable()
export class EncryptionService {
  /**
   * Encrypts a text string using AES-256-GCM (authenticated encryption).
   * Format: iv(hex):authTag(hex):ciphertext(hex)
   */
  encrypt(text: string): string {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, keyBuffer, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const authTag = cipher.getAuthTag();
    return (
      iv.toString('hex') +
      ':' +
      authTag.toString('hex') +
      ':' +
      encrypted.toString('hex')
    );
  }

  /**
   * Decrypts an AES-256-GCM encrypted string.
   * Throws if authentication tag verification fails (data tampered).
   */
  decrypt(text: string): string {
    const parts = text.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted text format.');
    }
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encryptedText = Buffer.from(parts[2], 'hex');
    const decipher = createDecipheriv(ALGORITHM, keyBuffer, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  }
}
