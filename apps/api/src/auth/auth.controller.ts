import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, { path: '/' });
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Record<string, unknown> }> {
    const validatedUser = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    const { accessToken, refreshToken, user } = await this.authService.login(validatedUser);
    setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: boolean }> {
    const rawRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!rawRefreshToken) {
      throw new UnauthorizedException('No hay token de actualización');
    }

    const { accessToken, newRefreshToken } =
      await this.authService.refreshAccessToken(rawRefreshToken);
    setAuthCookies(res, accessToken, newRefreshToken);
    return { ok: true };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ ok: boolean }> {
    const rawRefreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (rawRefreshToken) {
      await this.authService.revokeRefreshToken(rawRefreshToken);
    }
    clearAuthCookies(res);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ): Promise<Record<string, unknown>> {
    return this.authService.getCurrentUser(user.userId);
  }
}
