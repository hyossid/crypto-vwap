import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import { TransactionsSchema } from './websocket-watcher.repository.sql';

export class WebSocketWatcherRepository {
  private readonly logger = new Logger(WebSocketWatcherRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

  async insertTransaction(params: {
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
                                      price,
                                      is_validated)
          values (${params.tradeid},
                  ${params.ticker},
                  ${params.ts},
                  ${params.quantity},
                  ${params.price},
                  ${false}) on conflict(tradeid) 
                  do update set ticker = ${params.ticker},
                  ts = ${params.ts},
                  quantity = ${params.quantity},
                  price = ${params.price},
                  is_validated = ${false}
          returning *`);
      },
    );
  }
}
