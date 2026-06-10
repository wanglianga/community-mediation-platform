import { Controller, Get } from '@nestjs/common';
import { InMemoryStore } from '../../store/store';
import { CasesService } from '../cases/cases.service';
import { CasesController } from '../cases/cases.controller';
import { CasesModule } from '../cases/cases.module';

@Controller('stats')
export class StatsController {
  constructor(private readonly casesService: CasesService) {}
  @Get() dashboard() { return this.casesService.getStats(); }
}
