import {
  Controller,
  Post,
  Get,
  Patch,
  Query,
  Body,
  Res,
  Req,
  UseGuards,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SignupDto } from './dto/signup.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

const IS_PROD = process.env.NODE_ENV === 'production';

const ACCESS_TOKEN_COOKIE = 'access_token';
const REFRESH_TOKEN_COOKIE = 'refresh_token';

function setAuthCookies(
  res: Response,
  accessToken: string,
  refreshToken: string,
) {
  res.cookie(ACCESS_TOKEN_COOKIE, accessToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: '/',
  });

  res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_TOKEN_COOKIE, {
    path: '/',
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  });
  res.clearCookie(REFRESH_TOKEN_COOKIE, {
    path: '/',
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
  });
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @Get('check-email')
  async checkEmail(
    @Query('email') email: string,
  ): Promise<{ available: boolean }> {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new BadRequestException('Email inválido');
    }
    return this.authService.checkEmailAvailable(email);
  }

  @Throttle({ default: { limit: 5, ttl: 900000 } })
  @Post('signup')
  async signup(
    @Body() signupDto: SignupDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Record<string, unknown> }> {
    const { accessToken, refreshToken, user } =
      await this.authService.signup(signupDto);
    setAuthCookies(res, accessToken, refreshToken);
    return { user };
  }

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
    const { accessToken, refreshToken, user } =
      await this.authService.login(validatedUser);
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
  @Post('complete-profile')
  async completeProfile(
    @CurrentUser() user: { userId: string },
    @Body() dto: CompleteProfileDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ user: Record<string, unknown> }> {
    const {
      accessToken,
      refreshToken,
      user: responseUser,
    } = await this.authService.completeProfile(user.userId, dto);
    setAuthCookies(res, accessToken, refreshToken);
    return { user: responseUser };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ): Promise<Record<string, unknown>> {
    return this.authService.getCurrentUser(user.userId);
  }

  @Throttle({ default: { limit: 3, ttl: 900000 } })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ ok: boolean }> {
    await this.authService.requestPasswordReset(dto.email);
    return { ok: true };
  }

  @Throttle({ default: { limit: 3, ttl: 900000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ ok: boolean }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return { ok: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(
    @CurrentUser() user: { userId: string },
    @Body() body: { currentPassword: string; newPassword: string },
  ): Promise<{ ok: boolean }> {
    await this.authService.changePassword(
      user.userId,
      body.currentPassword,
      body.newPassword,
    );
    return { ok: true };
  }
}
