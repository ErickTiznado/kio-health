import { Controller, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';

// Protegido por el JwtAuthGuard global (ver app.module.ts).
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('profile')
  async updateProfile(
    @CurrentUser() user: { userId: string; email: string; role: string },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.userId, updateProfileDto);
  }
}
