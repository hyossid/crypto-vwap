import { Inject, Logger } from '@nestjs/common';
import { RedisClientType } from 'redis';
import WebSocket from 'ws';
import { VWAPCalculatorService } from './vwap-calculator.interface';
import { VWAPCalculatorRepository } from './vwap-calculator.repository';
import { LatestTicker } from './vwap-calculator.repository.sql';

const BUFFER_LIFETIME = 5 * 60;
export class DefaultVWAPCalculatorService implements VWAPCalculatorService {
  private logger = new Logger(DefaultVWAPCalculatorService.name);
  private client: undefined | WebSocket;
  private redisClient: undefined | RedisClientType;

  constructor(
    @Inject(VWAPCalculatorRepository)
    private readonly VWAPCalculatorRepository: VWAPCalculatorRepository,
  ) {}

  //   async calculateLatestVWAPfromBuffer(): Promise<void> {
  //     if (this.redisClient === undefined) {
  //       console.error("Couldn't reconnect to redis. Error callback is called.");
  //       return;
  //     }

  //     const latestFiveMinsData = await this.redisClient.zRangeByScore(
  //       'data',
  //       Date.now(),
  //       Date.now() - BUFFER_LIFETIME * 1000,
  //     );
  //   }

  async startCalculateVWAPfromDB(): Promise<void> {
    this.logger.log(`Start Processing calculating VWAP in DB`);

    for (;;) {
      await this.VWAPCalculatorRepository.processSavingVolumeInDb();
      //await sleep(100);
    }
  }

  async getLatestTicker(ticker: string): Promise<readonly LatestTicker[]> {
    return await this.VWAPCalculatorRepository.getLatestTickerFromDb(ticker);
  }
}

export const VWAPCalculatorProvider = {
  provide: VWAPCalculatorService,
  useClass: DefaultVWAPCalculatorService,
};

export default VWAPCalculatorProvider;
