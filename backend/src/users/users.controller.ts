import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me/stats')
  @UseGuards(JwtAuthGuard)
  getMyStats(@CurrentUser() user: AuthUser) {
    return this.users.getStats(user.id);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.id, dto);
  }

  @Patch('me/privacy')
  @UseGuards(JwtAuthGuard)
  updatePrivacy(@CurrentUser() user: AuthUser, @Body() dto: UpdatePrivacyDto) {
    return this.users.updatePrivacy(user.id, dto);
  }

  @Post('me/block/:blockedId')
  @UseGuards(JwtAuthGuard)
  block(
    @CurrentUser() user: AuthUser,
    @Param('blockedId') blockedId: string,
  ) {
    return this.users.blockUser(user.id, blockedId);
  }

  @Delete('me/block/:blockedId')
  @UseGuards(JwtAuthGuard)
  unblock(
    @CurrentUser() user: AuthUser,
    @Param('blockedId') blockedId: string,
  ) {
    return this.users.unblockUser(user.id, blockedId);
  }

  @Get(':id')
  getProfile(@Param('id') id: string) {
    return this.users.getProfile(id);
  }
}
