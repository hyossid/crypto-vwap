import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import {
  TickerVwap,
  _void,
} from '../vwap-calculator/vwap-calculator.repository.sql';
import {
  AvailableTickers,
  TickersValidationTimestamp,
  TransactionsSchema,
} from './rest-watcher.repository.sql';

const INTERVAL = process.env.INTERVAL
  ? Number(process.env.INTERVAL)
  : 5 * 60 * 1000;

export class RestWatcherRepository {
  private readonly logger = new Logger(RestWatcherRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

  async getSupportedTickers() {
    return this.persistentService.pgPool.any(sql<AvailableTickers>`
        select * from crypto_market.available_tickers;`);
  }

  async getLatestValidatedTime(ticker: string) {
    return this.persistentService.pgPool.any(sql<TickersValidationTimestamp>`
        select * from crypto_market.tickers_validation_timestamp where ticker = ${ticker};`);
  }

  async insertReliableTransaction(params: {
    ts: number;
    ticker: string;
    quantity: number;
    price: number;
    tradeid: string;
  }) {
    await this.persistentService.pgPool.transaction(async conn => {
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
                  ${true}) on conflict(tradeid) 
                  do update set ticker = ${params.ticker},
                  ts = ${params.ts},
                  quantity = ${params.quantity},
                  price = ${params.price},
                  is_validated = ${true}
          returning *`);

      await this.persistentService.pgPool.any(sql<_void>`
          update crypto_market.tickers_validation_timestamp
              set validated_until = ${params.ts}
          where ticker = ${params.ticker};`); // check sequence
    });
  }

  async processSavingValidatedVolumeInDB(params: {
    ticker: string;
    ts: number;
  }) {
    const timestampInSeconds = Math.floor(params.ts / 1000) * 1000;

    await this.persistentService.pgPool.transaction(async conn => {
      const vwaps = await conn.any(sql<TickerVwap>`
      with txs as (
        select *
                from crypto_market.transactions as ct
                  where ct.ts >= ${
                    params.ts - INTERVAL
                  } and ct.ts <= ${timestampInSeconds} 
                  and ticker = ${params.ticker} and is_validated = ${true})
                  select txs.ticker, sum(txs.price * txs.quantity) / sum(txs.quantity) as vwap 
                  from txs 
                  group by txs.ticker;`);

      for (const vwap of vwaps) {
        await this.persistentService.pgPool.query(sql<_void>`
                  insert into crypto_market.vwap_history
                      (ticker, ts, price, interval, is_validated)
                  values (${vwap.ticker},
                          ${timestampInSeconds},
                          ${vwap.vwap},
                          ${INTERVAL.toString()},
                          ${true})
                  on conflict(ticker,ts) do update set 
                  price = ${vwap.vwap},
                  is_validated = ${true};`);

        this.logger.log(
          `[REST] Calculated and saving Validated VWAP of ${params.ticker} at timestamp : ${timestampInSeconds}`,
        );
      }
    });
  }
}
