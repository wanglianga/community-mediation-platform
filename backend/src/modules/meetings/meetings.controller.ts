import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { MeetingsService } from './meetings.service';

@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}
  @Get() list(@Query('caseId') caseId?: string) { return this.service.list(caseId); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Put(':id') update(@Param('id') id: string, @Body() b: any) { return this.service.update(id, b); }
  @Post(':id/refusal') refusal(@Param('id') id: string, @Body() b: any) { return this.service.recordRefusal(id, b.participantId, b.reason); }
  @Post(':id/complete') complete(@Param('id') id: string, @Body() b: any) { return this.service.complete(id, b); }
}
