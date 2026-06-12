import { Module } from '@nestjs/common';
import { CluesController } from './clues.controller';
import { CluesService } from './clues.service';
import { CasesModule } from '../cases/cases.module';

@Module({
  imports: [CasesModule],
  controllers: [CluesController],
  providers: [CluesService],
})
export class CluesModule {}
