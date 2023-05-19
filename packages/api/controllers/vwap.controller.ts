import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { VWAPCalculatorService } from '@root/services/vwap-calculator/vwap-calculator.interface';
import { InputGuard } from '../guard/inputguard';

export class GetLatestVWAPResponse {}

@Controller()
export class VWAPController {
  private readonly logger = new Logger(VWAPController.name);
  constructor(
    @Inject(VWAPCalculatorService)
    private readonly vwapCalculatorService: VWAPCalculatorService,
  ) {}

  @UseGuards(InputGuard)
  @ApiOkResponse({ type: GetLatestVWAPResponse })
  @Get('/latest')
  async getLatestVWAP(
    @Query('ticker') ticker: string,
  ): Promise<GetLatestVWAPResponse> {
    this.logger.debug(`[API] GET /latest: ${ticker}`);

    const latestTicker = await this.vwapCalculatorService.getLatestTicker(
      ticker,
    );

    return {
      ticker,
      price: latestTicker[0].price,
      ts: latestTicker[0].ts,
    };
  }

  @UseGuards(InputGuard)
  @ApiOkResponse({ type: GetLatestVWAPResponse })
  @Get('/historical')
  async getHistoricalVWAP(
    @Query('ticker') ticker: string,
    @Query('ts') ts: number,
  ): Promise<GetLatestVWAPResponse> {
    this.logger.debug(`[API] GET /historical: ${ticker}, timestamp : ${ts}`);

    const historicalTicker =
      await this.vwapCalculatorService.getHistoricalTicker(ticker, ts);

    return {
      ticker,
      vwap: historicalTicker[0].price,
      ts: historicalTicker[0].ts,
    };
  }
}
