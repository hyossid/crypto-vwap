import { Inject, Logger } from '@nestjs/common';
import { noAwait } from '@root/commons/promise/no-await';
import { RestWatcherService } from '@root/services/rest-watcher/rest-watcher.interface';
import { RestWatcherRepository } from '@root/services/rest-watcher/rest-watcher.repository';
import fetch from 'cross-fetch';
import PQueue from 'p-queue';

const MARKET_REST_URL = process.env.MARKET_REST_URL
  ? process.env.MARKET_REST_URL
  : 'http://35.241.105.108/trades';
export class DefaultRestWatcherService implements RestWatcherService {
  private logger = new Logger(DefaultRestWatcherService.name);

  constructor(
    @Inject(RestWatcherRepository)
    private readonly restWatcherRepository: RestWatcherRepository,
  ) {}

  async startRestWatching() {
    this.logger.verbose(`Starting REST watching`);
    for (;;) {
      const tickers = await this.restWatcherRepository.getSupportedTickers();
      const queue = new PQueue({ concurrency: 20 });
      for (const ticker of tickers) {
        noAwait(queue.add(() => this.processRestByTicker(ticker.ticker)));
      }
      await queue.onIdle();
    }
  }

  async processRestByTicker(ticker: string): Promise<void> {
    const latestUpdatedTime = (
      await this.restWatcherRepository.getLatestValidatedTime(ticker)
    )[0].validated_until;

    this.logger.log(`[REST] Processing ${ticker} from ${latestUpdatedTime}`);
    const res = await fetch(
      `${MARKET_REST_URL}?ticker=${ticker}&startTime=${latestUpdatedTime}`,
      {
        method: 'GET',
      },
    );
    const newData = await res.json();
    // TODO : Check if this timestamp is the latest
    // const latestTimestamp = newData[0].ts;

    // save to transactions , set isValidated = True
    // newData should be sequential
    for (const data of newData.reverse()) {
      await this.restWatcherRepository.insertReliableTransaction({
        ts: data.ts,
        ticker: data.ticker,
        quantity: data.quantity,
        price: data.price,
        tradeid: data.tradeid,
      });

      await this.restWatcherRepository.processSavingValidatedVolumeInDB({
        ticker: data.ticker,
        ts: data.ts,
      });
    }
  }
}

const RestWatcherProvider = {
  provide: RestWatcherService,
  useClass: DefaultRestWatcherService,
};

export default RestWatcherProvider;
