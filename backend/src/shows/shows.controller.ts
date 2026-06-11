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
import { ShowInterestType } from '@prisma/client';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { CreateShowDto } from './dto/create-show.dto';
import { ListShowsDto } from './dto/list-shows.dto';
import { ShowsService } from './shows.service';

@Controller('shows')
export class ShowsController {
  constructor(private readonly shows: ShowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreateShowDto) {
    return this.shows.create(dto);
  }

  @Get()
  list(@Query() dto: ListShowsDto) {
    return this.shows.list(dto);
  }

  @Get('upcoming')
  upcoming(@Query() dto: ListShowsDto) {
    return this.shows.upcoming(dto);
  }

  @Get('hot')
  hot(@Query() dto: ListShowsDto) {
    return this.shows.hot(dto);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.shows.findById(id, user?.id);
  }

  @Get(':id/co-presence')
  @UseGuards(JwtAuthGuard)
  coPresence(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.shows.coPresenceUsers(id, user.id);
  }

  @Post(':id/want')
  @UseGuards(JwtAuthGuard)
  want(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.shows.setInterest(user.id, id, ShowInterestType.WANT_TO_SEE);
  }

  @Post(':id/attended')
  @UseGuards(JwtAuthGuard)
  attended(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.shows.setInterest(user.id, id, ShowInterestType.ATTENDED);
  }

  @Delete(':id/interest/:type')
  @UseGuards(JwtAuthGuard)
  removeInterest(
    @Param('id') id: string,
    @Param('type') type: ShowInterestType,
    @CurrentUser() user: AuthUser,
  ) {
    return this.shows.removeInterest(user.id, id, type);
  }
}
