import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  /** A-01: AI 多声线扩写 */
  @Post('expand')
  @UseGuards(JwtAuthGuard)
  expand(@Body('keywords') keywords: string[]) {
    return this.ai.expand(keywords || []);
  }

  /** A-02: AI 标签建议 */
  @Post('suggest-tags')
  @UseGuards(JwtAuthGuard)
  suggestTags(@Body('body') body: string) {
    return this.ai.suggestTags(body || '');
  }
}
