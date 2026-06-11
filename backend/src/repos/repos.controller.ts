import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { BatchVisibilityDto } from './dto/batch-visibility.dto';
import { CreateRepoDto } from './dto/create-repo.dto';
import { ListReposDto } from './dto/list-repos.dto';
import { UpdateRepoDto } from './dto/update-repo.dto';
import { ReposService } from './repos.service';

@Controller()
export class ReposController {
  constructor(private readonly repos: ReposService) {}

  @Post('repos')
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRepoDto) {
    return this.repos.create(user.id, dto);
  }

  @Get('repos/me/timeline')
  @UseGuards(JwtAuthGuard)
  myTimeline(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.repos.myTimeline(
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('repos/me/map')
  @UseGuards(JwtAuthGuard)
  myMap(@CurrentUser() user: AuthUser) {
    return this.repos.myMapSummary(user.id);
  }

  @Patch('repos/batch-visibility')
  @UseGuards(JwtAuthGuard)
  batchVisibility(
    @CurrentUser() user: AuthUser,
    @Body() dto: BatchVisibilityDto,
  ) {
    return this.repos.batchVisibility(user.id, dto);
  }

  @Get('repos/:id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.repos.findById(id, user?.id);
  }

  @Patch('repos/:id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateRepoDto,
  ) {
    return this.repos.update(id, user.id, dto);
  }

  @Delete('repos/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.repos.remove(id, user.id);
  }

  @Get('shows/:showId/repos')
  @UseGuards(OptionalJwtAuthGuard)
  listByShow(
    @Param('showId') showId: string,
    @Query() dto: ListReposDto,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.repos.listByShow(showId, dto, user?.id);
  }

  @Get('shows/:showId/memory-wall')
  memoryWall(@Param('showId') showId: string) {
    return this.repos.memoryWall(showId);
  }

  // S-04: 一句话记忆点赞
  @Post('repos/:repoId/memory-hook-like')
  @UseGuards(JwtAuthGuard)
  likeMemoryHook(@Param('repoId') repoId: string, @CurrentUser() user: AuthUser) {
    return this.repos.likeMemoryHook(user.id, repoId);
  }

  @Delete('repos/:repoId/memory-hook-like')
  @UseGuards(JwtAuthGuard)
  unlikeMemoryHook(@Param('repoId') repoId: string, @CurrentUser() user: AuthUser) {
    return this.repos.unlikeMemoryHook(user.id, repoId);
  }
}
