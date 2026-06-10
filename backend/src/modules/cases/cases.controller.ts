import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly service: CasesService) {}

  @Get() list(@Query() q: any) { return this.service.list(q); }
  @Get('stats') stats() { return this.service.getStats(); }
  @Get('supervision') supervision() { return this.service.getSupervisionCases(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Get(':id/timeline') timeline(@Param('id') id: string) { return this.service.getTimeline(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Put(':id') update(@Param('id') id: string, @Body() b: any) { return this.service.update(id, b); }
  @Post(':id/status') updateStatus(@Param('id') id: string, @Body() b: any) { return this.service.updateStatus(id, b.status, b.remark); }
  @Post(':id/assign') assign(@Param('id') id: string, @Body() b: any) { return this.service.assignMediator(id, b.mediatorId, b.mediatorName); }
}
