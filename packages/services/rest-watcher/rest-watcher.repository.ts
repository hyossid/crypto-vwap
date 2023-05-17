import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import { TransactionsSchema } from './rest-watcher.repository.sql';

export class RestWatcherRepository {
  private readonly logger = new Logger(RestWatcherRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

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
