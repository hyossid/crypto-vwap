import { Inject, Logger } from '@nestjs/common';
import { RestWatcherService } from '@root/services/rest-watcher/rest-watcher.interface';
import { RestWatcherRepository } from '@root/services/rest-watcher/rest-watcher.repository';
import axios from 'axios';
import fetch from 'cross-fetch';
import PQueue from 'p-queue';
const MARKET_REST_URL = 'http://35.241.105.108/trades';
const DEFAULT_TIMEOUT = 100000;
export class DefaultRestWatcherService implements RestWatcherService {
  private logger = new Logger(DefaultRestWatcherService.name);

  constructor(
    @Inject(RestWatcherRepository)
    private readonly restWatcherRepository: RestWatcherRepository,
  ) {}

  async startRestWatching() {
    this.logger.verbose(`Starting REST watching`);
    const tickers = await this.restWatcherRepository.getSupportedTickers();

    const queue = new PQueue({ concurrency: tickers.length });
    for (const ticker of tickers) {
      const processRest = async () => {
        //    TODO : ticker
      };

      // noAwait(
      //   queue.add(() =>
      //     pRetry(processRest, {
      //       onFailedAttempt: e => {
      //         this.logger.error(
      //           `fail: ${e}, retrying... - left: ${e.retriesLeft}, attempt: ${e.attemptNumber}`,
      //         );
      //       },
      //     }),
      //   ),
      // );
    }

    for (;;) {
      try {
        const trades: { data: { data: string } } = await axios.get(
          MARKET_REST_URL,
          {
            headers: { 'Content-Type': 'application/json' },
            timeout: DEFAULT_TIMEOUT,
          },
        );
      } catch (e: any) {
        if (axios.isAxiosError(e) && e.response?.status === 404) {
          return null;
        }
        throw e;
      }
    }
  }

  async processRestByTicker(ticker: string): Promise<void> {
    //get timestamp
    const latestUpdatedTime = (
      await this.restWatcherRepository.getLatestValidatedTime({ ticker })
    )[0].validated_until;

    // fetch
    const res = await fetch(
      `${MARKET_REST_URL}?ticker=${ticker}&startTime=${latestUpdatedTime}`,
      {
        method: 'GET',
      },
    );
    const newData = await res.json();

    // TODO : Check if this timestamp is the latest
    const latestTimestamp = newData[0].ts;

    // save to transactions , set isValidated = True

    //save and recalculate vwap which is less than latesetTimestamp and bigger than latestUpdatedTime

    console.log(newData);
  }
}

const RestWatcherProvider = {
  provide: RestWatcherService,
  useClass: DefaultRestWatcherService,
};

export default RestWatcherProvider;
