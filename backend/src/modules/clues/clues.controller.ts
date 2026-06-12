import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { CluesService } from './clues.service';

@Controller('clues')
export class CluesController {
  constructor(private readonly service: CluesService) {}
  @Get() list(@Query() q: any) { return this.service.list(q); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Post('check-repeat') checkRepeat(@Body() b: any) { return this.service.checkRepeatComplaint(b); }
  @Post(':id/accept') accept(@Param('id') id: string, @Body() b: any) { return this.service.accept(id, b?.originalCaseId, b); }
  @Post(':id/reject') reject(@Param('id') id: string, @Body() b: any) { return this.service.reject(id, b.reason); }
}
