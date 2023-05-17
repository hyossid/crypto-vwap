import { Module } from '@nestjs/common';
import { PersistentModule } from '@root/persistent/persistent.module';
import { RestWatcherRepository } from './rest-watcher.repository';
import RestWatcherProvider from './rest-watcher.service';

@Module({
  imports: [PersistentModule],
  providers: [RestWatcherRepository, RestWatcherProvider],
  exports: [RestWatcherProvider],
})
export class RestWatcherModule {}
