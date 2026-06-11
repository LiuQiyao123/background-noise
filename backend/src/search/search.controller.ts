import { Controller, Get, Query } from '@nestjs/common';
import { SearchQueryDto } from './dto/search.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  search(@Query() dto: SearchQueryDto) {
    return this.searchService.search(dto);
  }
}
