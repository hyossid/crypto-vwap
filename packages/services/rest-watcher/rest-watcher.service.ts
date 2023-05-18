import { Inject, Logger } from '@nestjs/common';
import { RestWatcherService } from '@root/services/rest-watcher/rest-watcher.interface';
import { RestWatcherRepository } from '@root/services/rest-watcher/rest-watcher.repository';
import axios from 'axios';
const MARKET_REST_URL = 'http://35.241.105.108/trade';
const DEFAULT_TIMEOUT = 100000;
export class DefaultRestWatcherService implements RestWatcherService {
  private logger = new Logger(DefaultRestWatcherService.name);

  constructor(
    @Inject(RestWatcherRepository)
    private readonly restWatcherRepository: RestWatcherRepository,
  ) {}

  async startRestWatching() {
    this.logger.verbose(`Starting REST watching`);

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
}

const RestWatcherProvider = {
  provide: RestWatcherService,
  useClass: DefaultRestWatcherService,
};

export default RestWatcherProvider;
