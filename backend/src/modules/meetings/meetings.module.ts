import { Module } from '@nestjs/common';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';
import { InMemoryStore } from '../../store/store';

@Module({
  controllers: [MeetingsController],
  providers: [MeetingsService, InMemoryStore],
})
export class MeetingsModule {}
