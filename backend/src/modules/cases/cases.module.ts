import { Module } from '@nestjs/common';
import { CasesController } from './cases.controller';
import { CasesService } from './cases.service';
import { InMemoryStore } from '../../store/store';

@Module({
  controllers: [CasesController],
  providers: [CasesService, InMemoryStore],
  exports: [CasesService, InMemoryStore],
})
export class CasesModule {}
