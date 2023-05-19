import { Inject, Logger } from '@nestjs/common';
import { VWAPCalculatorService } from './vwap-calculator.interface';
import { VWAPCalculatorRepository } from './vwap-calculator.repository';
import { LatestTicker } from './vwap-calculator.repository.sql';

const BUFFER_LIFETIME = 5 * 60;
export class DefaultVWAPCalculatorService implements VWAPCalculatorService {
  private logger = new Logger(DefaultVWAPCalculatorService.name);

  constructor(
    @Inject(VWAPCalculatorRepository)
    private readonly VWAPCalculatorRepository: VWAPCalculatorRepository,
  ) {}

  async startCalculateVWAPfromDB(): Promise<void> {
    this.logger.log(`Start Processing calculating VWAP in DB`);

    for (;;) {
      await this.VWAPCalculatorRepository.processSavingVolumeInDb();
    }
  }

  async getLatestTicker(ticker: string): Promise<readonly LatestTicker[]> {
    return await this.VWAPCalculatorRepository.getLatestTickerFromDb(ticker);
  }

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
