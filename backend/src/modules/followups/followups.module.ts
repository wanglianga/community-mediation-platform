import { Module } from '@nestjs/common';
import { FollowupsController } from './followups.controller';
import { FollowupsService } from './followups.service';
import { InMemoryStore } from '../../store/store';

@Module({
  controllers: [FollowupsController],
  providers: [FollowupsService, InMemoryStore],
})
export class FollowupsModule {}
