import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: Record<string, unknown> }> {
    const validatedUser = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(validatedUser);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(
    @CurrentUser() user: { userId: string; email: string; role: string },
  ): Promise<Record<string, unknown>> {
    return this.authService.getCurrentUser(user.userId);
  }
}
