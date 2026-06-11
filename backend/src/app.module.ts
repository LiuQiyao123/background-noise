import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { MatchesModule } from './matches/matches.module';
import { MediaModule } from './media/media.module';
import { PrismaModule } from './prisma/prisma.module';
import { DiscoverModule } from './discover/discover.module';
import { ReportsModule } from './reports/reports.module';
import { ReposModule } from './repos/repos.module';
import { SearchModule } from './search/search.module';
import { ShowsModule } from './shows/shows.module';
import { UsersModule } from './users/users.module';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ShowsModule,
    ReposModule,
    MediaModule,
    LikesModule,
    CommentsModule,
    SearchModule,
    ReportsModule,
    DiscoverModule,
    MatchesModule,
    AiModule,
  ],
})
export class AppModule {}
