import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import {
  Ticker,
  TickersValidationTimestamp,
  TransactionsSchema,
} from './rest-watcher.repository.sql';

export class RestWatcherRepository {
  private readonly logger = new Logger(RestWatcherRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

  async getSupportedTickers() {
    return this.persistentService.pgPool.any(sql<Ticker>`
        select * from crypto_market.tickers;`);
  }

  async getLatestValidatedTime(params: { ticker: string }) {
    return this.persistentService.pgPool.any(sql<TickersValidationTimestamp>`
        select * from crypto_market.tickers_validation_timestamp where ticker = ${params.ticker};`);
  }

  async insertReliableTransaction(params: {
    ts: number;
    ticker: string;
    quantity: number;
    price: number;
    tradeid: string;
  }) {
    await this.persistentService.pgPool.transaction(
      async (conn: { one: (arg0: any) => any }) => {
        await conn.one(sql<TransactionsSchema>`
          insert into crypto_market.transactions(tradeid,
                                      ticker,
                                      ts,
                                      quantity,
                                      price)
          values (${params.tradeid},
                  ${params.ticker},
                  ${params.ts},
                  ${params.quantity},
                  ${params.price}) on conflict(tradeid) 
                  do update set ticker = ${params.ticker},
                  ts = ${params.ts},
                  quantity = ${params.quantity},
                  price = ${params.price}
          returning *`);
      },
    );
  }
}
