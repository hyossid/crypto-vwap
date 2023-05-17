import { Inject, Logger } from '@nestjs/common';
import { noAwait } from '@root/commons/promise/no-await';
import PQueue from 'p-queue';
import { RestWatcherService } from '../rest-watcher/rest-watcher.interface';
import { WebSocketWatcherService } from '../websocket-watcher/websocket-watcher.interface';
import { MarketWatcherService } from './market-watcher.interface';

export class DefaultMarketWatcherServiceService
  implements MarketWatcherService
{
  private logger = new Logger(DefaultMarketWatcherServiceService.name);
  private readonly queue = new PQueue({ concurrency: 25 });

  constructor(
    @Inject(WebSocketWatcherService)
    private readonly webSocketWatcherService: WebSocketWatcherService,
    @Inject(RestWatcherService)
    private readonly restWatcherService: RestWatcherService,
  ) {}

  async start(features: {
    websocket: boolean;
    trades: boolean;
  }): Promise<void> {
    if (features.websocket) {
      noAwait(
        this.queue.add(() =>
          this.webSocketWatcherService.startWebSocketWatching(),
        ),
      );
    }

    if (features.trades) {
      noAwait(
        this.queue.add(() => this.restWatcherService.startRestWatching()),
      );
    }
  }
}

export const MarketWatcherProvider = {
  provide: MarketWatcherService,
  useClass: DefaultMarketWatcherServiceService,
};

export default MarketWatcherProvider;
