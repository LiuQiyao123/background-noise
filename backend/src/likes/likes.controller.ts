import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { LikesService } from './likes.service';

@Controller('repos/:repoId/like')
export class LikesController {
  constructor(private readonly likes: LikesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  like(@Param('repoId') repoId: string, @CurrentUser() user: AuthUser) {
    return this.likes.like(user.id, repoId);
  }

  @Delete()
  @UseGuards(JwtAuthGuard)
  unlike(@Param('repoId') repoId: string, @CurrentUser() user: AuthUser) {
    return this.likes.unlike(user.id, repoId);
  }
}
