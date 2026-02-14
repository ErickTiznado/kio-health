import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient as BasePrismaClient } from '#generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';

// Create a custom PrismaClient with the PostgreSQL adapter
@Injectable()
export class PrismaService
  extends BasePrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL!,
    });
    super({ adapter } as never);
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
