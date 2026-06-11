import { Module } from '@nestjs/common';
import { MatchesModule } from '../matches/matches.module';
import { UsersModule } from '../users/users.module';
import { ReposController } from './repos.controller';
import { ReposService } from './repos.service';

@Module({
  imports: [UsersModule, MatchesModule],
  controllers: [ReposController],
  providers: [ReposService],
  exports: [ReposService],
})
export class ReposModule {}
