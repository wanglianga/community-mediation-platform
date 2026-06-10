import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}
  @Get() list(@Query('caseId') caseId?: string) { return this.service.list(caseId); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Get(':id/key-check') checkKeyParties(@Param('id') id: string) { return this.service.checkKeyPartiesAttended(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Put(':id') update(@Param('id') id: string, @Body() b: any) { return this.service.update(id, b); }
  @Post(':id/participants') addParticipant(@Param('id') id: string, @Body() b: any) { return this.service.addParticipant(id, b); }
  @Delete(':id/participants/:pid') removeParticipant(@Param('id') id: string, @Param('pid') pid: string) { return this.service.removeParticipant(id, pid); }
  @Put(':id/participants/:pid') updateParticipant(@Param('id') id: string, @Param('pid') pid: string, @Body() b: any) { return this.service.updateParticipant(id, pid, b); }
  @Post(':id/refusal') refusal(@Param('id') id: string, @Body() b: any) { return this.service.recordRefusal(id, b.participantId, b.reason); }
  @Post(':id/absent') absent(@Param('id') id: string, @Body() b: any) { return this.service.recordAbsent(id, b.participantId, b.reason); }
  @Post(':id/complete') complete(@Param('id') id: string, @Body() b: any) { return this.service.complete(id, b); }
}
