import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt.guard';
import { DiscoverService } from './discover.service';

@Controller('discover')
export class DiscoverController {
  constructor(private readonly discover: DiscoverService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  feed(@Query('limit') limit?: string, @CurrentUser() user?: AuthUser | null) {
    return this.discover.feed(limit ? parseInt(limit, 10) : 10, user?.id);
  }
}
