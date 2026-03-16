import { createTestEncryptionService } from '../test/encryption-helpers';

describe('EncryptionService', () => {
  const service = createTestEncryptionService();

  describe('encrypt()', () => {
    it('produces 3 colon-separated hex parts', () => {
      const result = service.encrypt('hello');
      const parts = result.split(':');
      expect(parts).toHaveLength(3);
      parts.forEach((p) => expect(p).toMatch(/^[0-9a-fA-F]+$/));
    });

    it('produces different ciphertext on each call (random IV)', () => {
      const c1 = service.encrypt('same text');
      const c2 = service.encrypt('same text');
      expect(c1).not.toBe(c2);
    });
  });

  describe('decrypt()', () => {
    it('round-trip: decrypt(encrypt(text)) === text', () => {
      const plaintext = 'Hello, World!';
      expect(service.decrypt(service.encrypt(plaintext))).toBe(plaintext);
    });

    it('round-trip with unicode', () => {
      const text = '¡Hola! 日本語 🔒 — diagnóstico clínico';
      expect(service.decrypt(service.encrypt(text))).toBe(text);
    });

    it('round-trip with empty string', () => {
      expect(service.decrypt(service.encrypt(''))).toBe('');
    });

    it('round-trip with long string (1000 chars)', () => {
      const long = 'x'.repeat(1000);
      expect(service.decrypt(service.encrypt(long))).toBe(long);
    });

    it('round-trip with JSON-stringified objects (emergencyContact pattern)', () => {
      const contact = JSON.stringify({ name: 'María', phone: '+52 55 1234 5678' });
      const decrypted = service.decrypt(service.encrypt(contact));
      expect(JSON.parse(decrypted)).toEqual({ name: 'María', phone: '+52 55 1234 5678' });
    });

    it('throws on tampered ciphertext bytes', () => {
      const encrypted = service.encrypt('secret');
      const parts = encrypted.split(':');
      // Flip last byte of ciphertext
      const hex = parts[2];
      const tampered = hex.slice(0, -2) + (hex.slice(-2) === 'ff' ? '00' : 'ff');
      expect(() => service.decrypt(`${parts[0]}:${parts[1]}:${tampered}`)).toThrow();
    });

    it('throws on tampered auth tag', () => {
      const encrypted = service.encrypt('secret');
      const parts = encrypted.split(':');
      const badTag = 'a'.repeat(parts[1].length);
      expect(() => service.decrypt(`${parts[0]}:${badTag}:${parts[2]}`)).toThrow();
    });

    it('throws on tampered IV (auth tag mismatch)', () => {
      const encrypted = service.encrypt('secret');
      const parts = encrypted.split(':');
      const badIv = 'b'.repeat(parts[0].length);
      expect(() => service.decrypt(`${badIv}:${parts[1]}:${parts[2]}`)).toThrow();
    });

    it('throws if format does not have 3 parts — too few', () => {
      expect(() => service.decrypt('onlyone')).toThrow('Invalid encrypted text format.');
      expect(() => service.decrypt('two:parts')).toThrow('Invalid encrypted text format.');
    });

    it('throws if format has too many parts', () => {
      expect(() => service.decrypt('a:b:c:d')).toThrow('Invalid encrypted text format.');
    });

    it('propagates error — does not return garbage silently', () => {
      let threw = false;
      try {
        service.decrypt('bad:format:test_extra:extra');
      } catch {
        threw = true;
      }
      expect(threw).toBe(true);
    });
  });
});
