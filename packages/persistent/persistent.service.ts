import { OnModuleDestroy } from '@nestjs/common';

import {
  createDateTypeParser,
  createIntervalTypeParser,
  createPool,
  createTimestampTypeParser,
  createTimestampWithTimeZoneTypeParser,
  DatabasePool,
} from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';
import { PersistentService } from './persistent.interface';

const PG_CONNECTION_STRING =
  'postgres://postgres:postgres@localhost:61791/crypto_market';

export class DefaultPersistentService
  extends PersistentService
  implements OnModuleDestroy
{
  private readonly _pgPool: DatabasePool | null = null;

  get pgPool(): DatabasePool {
    if (this._pgPool === null) {
      throw new Error('pgPool is not initialized');
    }
    return this._pgPool;
  }

  constructor() {
    super();
    this._pgPool = createPool(PG_CONNECTION_STRING, {
      typeParsers: [
        createDateTypeParser(),
        createIntervalTypeParser(),
        createTimestampTypeParser(),
        createTimestampWithTimeZoneTypeParser(),
      ],
      interceptors: [createQueryLoggingInterceptor()],
    });
  }

  onModuleDestroy() {
    return this.pgPool.end();
  }
}

const PersistentServiceProvider = {
  provide: PersistentService,
  useClass: DefaultPersistentService,
};

export default PersistentServiceProvider;
