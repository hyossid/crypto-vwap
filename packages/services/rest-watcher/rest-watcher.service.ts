import { Inject, Logger } from '@nestjs/common';
import { noAwait } from '@root/commons/promise/no-await';
import { RestWatcherService } from '@root/services/rest-watcher/rest-watcher.interface';
import { RestWatcherRepository } from '@root/services/rest-watcher/rest-watcher.repository';
import fetch from 'cross-fetch';
import PQueue from 'p-queue';

const MARKET_REST_URL =
  process.env.MARKET_REST_URL ?? 'http://35.241.105.108/trades';
export class DefaultRestWatcherService implements RestWatcherService {
  private logger = new Logger(DefaultRestWatcherService.name);

  constructor(
    @Inject(RestWatcherRepository)
    private readonly restWatcherRepository: RestWatcherRepository,
  ) {}

  async startRestWatching() {
    this.logger.verbose(`Starting REST watching`);
    for (;;) {
      // get existing tickers from view
      const tickers = await this.restWatcherRepository.getSupportedTickers();

      // process REST fetching in async, need to increase this concurrency if tickers go over 20
      const queue = new PQueue({ concurrency: 20 });
      for (const ticker of tickers) {
        noAwait(queue.add(() => this.processRestByTicker(ticker.ticker)));
      }
      await queue.onIdle();
    }
  }

  async processRestByTicker(ticker: string): Promise<void> {
    // fetch last validated time
    const lastValidatedTime = (
      await this.restWatcherRepository.getLatestValidatedTime(ticker)
    )[0].validated_until;

    this.logger.log(`[REST] Processing ${ticker} from ${lastValidatedTime}`);
    const res = await fetch(
      `${MARKET_REST_URL}?ticker=${ticker}&startTime=${lastValidatedTime}`,
      {
        method: 'GET',
      },
    );
    const reliableData = await res.json();

    // Make sure reliableData is in chronological order
    reliableData.sort((a: { ts: number }, b: { ts: number }) => a.ts - b.ts);

    for (const data of reliableData) {
      // insert reliable data to db
      await this.restWatcherRepository.insertReliableTransaction({
        ts: data.ts,
        ticker: data.ticker,
        quantity: data.quantity,
        price: data.price,
        tradeid: data.tradeid,
      });

      // calculate and save VWAP with reliable data
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
