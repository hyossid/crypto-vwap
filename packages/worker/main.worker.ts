import { NestFactory } from '@nestjs/core';
import { parseLogLevelsConfig } from '@root/commons/utils/log.utils';

import { MarketWatcherService } from '@root/services/market-watcher/market-watcher.interface';
import { MarketWatcherModule } from '@root/services/market-watcher/market-watcher.module';
async function bootstrap() {
  const app = await NestFactory.create(MarketWatcherModule, {
    logger: parseLogLevelsConfig(),
  });

  const worker = app.get(MarketWatcherService);

  /**
   * Can switch on and off each features in worker
   *
   * - websocket : Listens and save streamed data to DB
   * - rest : Validates saved data and recalculate VWAP value
   * - vwapdb : Calculate VWAP from existing trade data
   *
   **/
  await worker.start({ websocket: true, rest: true, vwapdb: true });
}

if (require.main == module) {
  bootstrap().then(console.log).catch(console.error);
}
