import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('repos/:repoId/comments')
export class CommentsController {
  constructor(private readonly comments: CommentsService) {}

  @Get()
  list(
    @Param('repoId') repoId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.comments.list(
      repoId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Param('repoId') repoId: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.comments.create(user.id, repoId, dto);
  }

  @Delete(':commentId')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('commentId') commentId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.comments.remove(commentId, user.id);
  }
}
