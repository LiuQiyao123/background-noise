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
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { CreateMemoryDto } from './dto/create-memory.dto';
import { MemoryQueryDto } from './dto/memory-query.dto';
import { MemoryService } from './memory.service';

@Controller()
export class MemoryController {
  constructor(private readonly memory: MemoryService) {}

  @Post('memories')
  @UseGuards(JwtAuthGuard)
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMemoryDto) {
    return this.memory.create(user.id, dto);
  }

  @Get('shows/:id/memories')
  @UseGuards(OptionalJwtAuthGuard)
  findByShow(
    @Param('id') id: string,
    @Query() query: MemoryQueryDto,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.memory.findByShow(id, query, user?.id);
  }

  @Get('shows/:id/my-memory')
  @UseGuards(JwtAuthGuard)
  findMyMemory(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.memory.findMyMemory(id, user.id);
  }

  @Get('memories/:id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.memory.findById(id, user?.id);
  }

  @Delete('memories/:id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.memory.remove(id, user.id);
  }
}
