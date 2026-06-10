import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { FollowupsService } from './followups.service';

@Controller('followups')
export class FollowupsController {
  constructor(private readonly service: FollowupsService) {}
  @Get() list(@Query() q: any) { return this.service.list(q); }
  @Get('upcoming') upcoming() { return this.service.getUpcoming(); }
  @Get(':id') get(@Param('id') id: string) { return this.service.get(id); }
  @Post() create(@Body() b: any) { return this.service.create(b); }
  @Post(':id/complete') complete(@Param('id') id: string, @Body() b: any) { return this.service.complete(id, b); }
}
