import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { PrismaModule } from '../prisma/prisma.module';
import { DiscoverController } from './discover.controller';
import { DiscoverService } from './discover.service';

@Module({
  imports: [PrismaModule, MatchesModule],
  controllers: [DiscoverController],
  providers: [DiscoverService],
})
export class DiscoverModule {}
