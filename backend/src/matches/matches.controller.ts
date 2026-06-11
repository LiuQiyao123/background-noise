import { Controller, Get, Param, Patch, Post, Query, UseGuards, Body } from '@nestjs/common';
import { MatchStatus } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { MatchesService } from './matches.service';

@Controller('match')
export class MatchesController {
  constructor(private readonly matches: MatchesService) {}

  @Post('trigger/:repoId')
  @UseGuards(JwtAuthGuard)
  trigger(@Param('repoId') repoId: string) {
    return this.matches.triggerMatch(repoId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  getMyMatches(
    @CurrentUser() user: AuthUser,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.matches.getMyMatches(user.id, +page, +limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateMatch(@Param('id') id: string, @Body('status') status: MatchStatus) {
    return this.matches.updateMatch(id, status);
  }

  @Get('blind-box')
  @UseGuards(JwtAuthGuard)
  getBlindBox(@CurrentUser() user: AuthUser) {
    return this.matches.getBlindBox(user.id);
  }
}
