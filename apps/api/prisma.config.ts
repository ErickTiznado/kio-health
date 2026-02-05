import path from 'node:path';
import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';

// Load environment variables from .env
config();

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || '',
  },
  migrations: {
    seed: 'npx ts-node --transpile-only prisma/seed.ts',
  },
});
