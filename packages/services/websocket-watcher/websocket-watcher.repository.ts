import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import {
  TickersValidationTimestamp,
  TransactionsSchema,
  ValidatedUntil,
} from './websocket-watcher.repository.sql';

export class WebSocketWatcherRepository {
  private readonly logger = new Logger(WebSocketWatcherRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

  // Save raw transaction received from websocket stream
  // websocket raw transaction can be faulty; is_validated = false
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

  // Save the smallest timestamp to the config table 'tickers_validation_timestamp'
  // If DB already keeps the ticker and value, skip it.
  async insertInitialValidationTime(params: { ts: number; ticker: string }) {
    await this.persistentService.pgPool.transaction(async conn => {
      const curTs = await conn.any(sql<ValidatedUntil>`
      select validated_until from crypto_market.tickers_validation_timestamp where ticker = ${params.ticker}`);

      if (curTs.length == 0) {
        await conn.any(sql<TickersValidationTimestamp>`
        insert into crypto_market.tickers_validation_timestamp(ticker,
                                  validated_until)
        values (${params.ticker},
                ${params.ts}) on conflict do nothing`);
      } else {
        if (curTs[0].validated_until > params.ts) {
          await conn.any(sql<TickersValidationTimestamp>`
          insert into crypto_market.tickers_validation_timestamp(ticker,
                                    validated_until)
          values (${params.ticker},
                  ${params.ts}) on conflict(ticker) do update set validated_until = ${params.ts}`);
        }
        return;
      }
    });
  }
}
