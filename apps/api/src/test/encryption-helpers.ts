import { EncryptionService } from '../lib/encryption.service';

export const TEST_ENCRYPTION_KEY = 'a'.repeat(64);

export function createTestEncryptionService(): EncryptionService {
  // ENCRYPTION_KEY is set in jest-setup.ts before this module loads
  return new EncryptionService();
}
