import './instrument'; // Must be imported before anything else
import { NestFactory, BaseExceptionFilter } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import * as Sentry from '@sentry/nestjs';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cookieParser = require('cookie-parser');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  // Cookie parser (must be before guards that read cookies)
  app.use(cookieParser());

  // CORS must be enabled before helmet so OPTIONS preflight requests are handled first
  const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
    : ['http://localhost:5173'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization',
    credentials: true,
  });

  // Security Headers with explicit CSP
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          frameSrc: ["'none'"],
          upgradeInsecureRequests: [],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  );

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
