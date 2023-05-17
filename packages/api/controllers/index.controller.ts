import { Controller, Get } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class IndexController {
  @ApiExcludeEndpoint()
  @Get()
  index(): string {
    return 'VWAP API';
  }

  @ApiExcludeEndpoint()
  @Get('/health')
  health(): string {
    return 'OK';
  }
}
