import { Module } from '@nestjs/common';
import { CluesController } from './clues.controller';
import { CluesService } from './clues.service';
import { InMemoryStore } from '../../store/store';

@Module({
  controllers: [CluesController],
  providers: [CluesService, InMemoryStore],
})
export class CluesModule {}
