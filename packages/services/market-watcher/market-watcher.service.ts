import { Inject, Logger } from '@nestjs/common';
import { noAwait } from '@root/commons/promise/no-await';
import PQueue from 'p-queue';
import { RestWatcherService } from '../rest-watcher/rest-watcher.interface';
import { VWAPCalculatorService } from '../vwap-calculator/vwap-calculator.interface';
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
    @Inject(VWAPCalculatorService)
    private readonly vwapCalculatorService: VWAPCalculatorService,
  ) {}

  async start(features: {
    websocket: boolean;
    rest: boolean;
    vwapdb: boolean;
  }): Promise<void> {
    this.logger.log(
      `[WORKER] Starting Worker with option websocket : ${features.websocket} , rest : ${features.rest} , vwapdb : ${features.vwapdb}`,
    );

    if (features.websocket) {
      noAwait(
        this.queue.add(() =>
          this.webSocketWatcherService.startWebSocketWatching(),
        ),
      );
    }

    if (features.rest) {
      noAwait(
        this.queue.add(() => this.restWatcherService.startRestWatching()),
      );
    }

    if (features.vwapdb) {
      noAwait(
        this.queue.add(() =>
          this.vwapCalculatorService.startCalculateVWAPfromDB(),
        ),
      );
    }
  }
}

export const MarketWatcherProvider = {
  provide: MarketWatcherService,
  useClass: DefaultMarketWatcherServiceService,
};

export default MarketWatcherProvider;
