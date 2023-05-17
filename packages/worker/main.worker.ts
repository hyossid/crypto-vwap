import { NestFactory } from '@nestjs/core';
import { parseLogLevelsConfig } from '@root/commons/utils/log.utils';

import { MarketWatcherService } from '@root/services/market-watcher/market-watcher.interface';
import { MarketWatcherModule } from '@root/services/market-watcher/market-watcher.module';
async function bootstrap() {
  const app = await NestFactory.create(MarketWatcherModule, {
    logger: parseLogLevelsConfig(),
  });

  const worker = app.get(MarketWatcherService);

  await worker.start({ websocket: true, trades: true });
}

if (require.main == module) {
  bootstrap().then(console.log).catch(console.error);
}
