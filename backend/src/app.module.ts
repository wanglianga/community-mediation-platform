import { Module } from '@nestjs/common';
import { StoreModule } from './store/store.module';
import { CasesModule } from './modules/cases/cases.module';
import { CluesModule } from './modules/clues/clues.module';
import { MeetingsModule } from './modules/meetings/meetings.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { StatsModule } from './modules/stats/stats.module';

@Module({
  imports: [StoreModule, CasesModule, CluesModule, MeetingsModule, AgreementsModule, FollowupsModule, StatsModule],
})
export class AppModule {}
