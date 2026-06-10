import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { CasesService } from './cases.service';

@Controller('cases')
export class CasesController {
  constructor(private readonly service: CasesService) {}

  @Get() list(@Query() q: any) { return this.service.list(q); }
  @Get('stats') stats() { return this.service.getStats(); }
  @Get('supervision') supervision() { return this.service.getSupervisionCases(); }
  @Get('similar') findSimilar(@Query() q: any) { return this.service.findSimilarCases(q.partyName, q.category, q.excludeId); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Get(':id/timeline') timeline(@Param('id') id: string) { return this.service.getTimeline(id); }
  @Get(':id/warnings') warnings(@Param('id') id: string) { return this.service.getWarnings(id); }
  @Get(':id/merge-records') mergeRecords(@Param('id') id: string) { return this.service.getMergeRecords(id); }
  @Get(':id/merged-info') mergedInfo(@Param('id') id: string) { return this.service.getMergedCaseInfo(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Put(':id') update(@Param('id') id: string, @Body() b: any) { return this.service.update(id, b); }
  @Post(':id/status') updateStatus(@Param('id') id: string, @Body() b: any) { return this.service.updateStatus(id, b.status, b.remark); }
  @Post(':id/assign') assign(@Param('id') id: string, @Body() b: any) { return this.service.assignMediator(id, b.mediatorId, b.mediatorName); }
  @Post(':id/warnings') addWarning(@Param('id') id: string, @Body() b: any) { return this.service.addWarning(id, b); }
  @Post(':id/escalation-action') setEscalationAction(@Param('id') id: string, @Body() b: any) { return this.service.setEscalationAction(id, b.action, b.operatorName); }
  @Post(':id/merge') mergeCase(@Param('id') id: string, @Body() b: any) { return this.service.mergeCases(id, b.mergedCaseId, b); }
}
