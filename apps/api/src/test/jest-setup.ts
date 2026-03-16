// Must run before any module is imported so that module-level env checks pass.
process.env.JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars!!';
process.env.ENCRYPTION_KEY = 'a'.repeat(64); // 64 hex chars = 32 bytes
process.env.DATABASE_URL = 'postgresql://test';
