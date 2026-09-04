import { SetMetadata } from '@nestjs/common';

/**
 * Marca un endpoint como público, saltándose el `JwtAuthGuard` global.
 *
 * Como `JwtAuthGuard` es `APP_GUARD` (ver app.module.ts), TODA ruta nace
 * protegida. Usa `@Public()` solo en los endpoints que de verdad no pueden
 * exigir un access token válido: login, refresh (usa la refresh cookie),
 * callbacks OAuth de terceros, enlaces de email al paciente, health check.
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
