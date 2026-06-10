import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { AgreementsService } from './agreements.service';

@Controller('agreements')
export class AgreementsController {
  constructor(private readonly service: AgreementsService) {}
  @Get() list(@Query('caseId') caseId?: string) { return this.service.list(caseId); }
  @Get('fulfillments') fulfillments() { return this.service.getFulfillmentList(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Get(':id/nodes') nodes(@Param('id') id: string) { return this.service.getFulfillmentNodes(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Post(':id/sign') sign(@Param('id') id: string, @Body() b: any) { return this.service.sign(id, b.partyId); }
  @Post(':id/reject') reject(@Param('id') id: string, @Body() b: any) { return this.service.reject(id, b.partyId, b.reason); }
  @Put('nodes/:nodeId') updateNode(@Param('nodeId') nodeId: string, @Body() b: any) { return this.service.updateFulfillmentNode(nodeId, b); }
}
