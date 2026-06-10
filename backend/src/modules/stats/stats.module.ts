import { Module } from '@nestjs/common';
import { CasesModule } from '../cases/cases.module';
import { StatsController } from './stats.controller';

@Module({
  imports: [CasesModule],
  controllers: [StatsController],
})
export class StatsModule {}
