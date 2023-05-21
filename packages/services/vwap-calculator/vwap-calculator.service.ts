import { Inject, Logger } from '@nestjs/common';
import { VWAPCalculatorService } from './vwap-calculator.interface';
import { VWAPCalculatorRepository } from './vwap-calculator.repository';
import { LatestTicker } from './vwap-calculator.repository.sql';

export class DefaultVWAPCalculatorService implements VWAPCalculatorService {
  private logger = new Logger(DefaultVWAPCalculatorService.name);

  constructor(
    @Inject(VWAPCalculatorRepository)
    private readonly VWAPCalculatorRepository: VWAPCalculatorRepository,
  ) {}

  async startCalculateVWAPfromDB(): Promise<void> {
    this.logger.log(
      `[VWAP Calculator] Start Processing calculating VWAP in DB`,
    );

    // Start calculating VWAP as fast as possible.
    for (;;) {
      await this.VWAPCalculatorRepository.processSavingVolumeInDb();
    }
  }

  // get Latest VWAP value for api
  async getLatestTicker(ticker: string): Promise<readonly LatestTicker[]> {
    return await this.VWAPCalculatorRepository.getLatestTickerFromDb(ticker);
  }

  // get Historical VWAP value for api
  async getHistoricalTicker(
    ticker: string,
    ts: number,
  ): Promise<readonly LatestTicker[]> {
    return await this.VWAPCalculatorRepository.getHistoricalTickerFromDb(
      ticker,
      ts,
    );
  }
}

export const VWAPCalculatorProvider = {
  provide: VWAPCalculatorService,
  useClass: DefaultVWAPCalculatorService,
};

export default VWAPCalculatorProvider;
