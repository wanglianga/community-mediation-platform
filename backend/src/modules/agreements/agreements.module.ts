import { Module } from '@nestjs/common';
import { AgreementsController } from './agreements.controller';
import { AgreementsService } from './agreements.service';
import { InMemoryStore } from '../../store/store';

@Module({
  controllers: [AgreementsController],
  providers: [AgreementsService, InMemoryStore],
})
export class AgreementsModule {}
