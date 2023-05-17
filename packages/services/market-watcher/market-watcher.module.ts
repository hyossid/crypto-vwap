import { Module } from '@nestjs/common';
import { RestWatcherModule } from '../rest-watcher/rest-watcher.module';
import { WebSocketWatcherModule } from '../websocket-watcher/websocket-watcher.module';
import MarketWatcherProvider from './market-watcher.service';

@Module({
  imports: [WebSocketWatcherModule, RestWatcherModule],
  providers: [MarketWatcherProvider],
  exports: [MarketWatcherProvider],
})
export class MarketWatcherModule {}
