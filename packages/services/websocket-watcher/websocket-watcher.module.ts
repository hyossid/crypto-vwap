import { Module } from '@nestjs/common';
import { PersistentModule } from '@root/persistent/persistent.module';
import { WebSocketWatcherRepository } from './websocket-watcher.repository';
import WebSocketWatcherProvider from './websocket-watcher.service';

@Module({
  imports: [PersistentModule],
  providers: [WebSocketWatcherRepository, WebSocketWatcherProvider],
  exports: [WebSocketWatcherProvider],
})
export class WebSocketWatcherModule {}
