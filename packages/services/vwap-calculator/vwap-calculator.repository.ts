import { Inject, Logger } from '@nestjs/common';
import { PersistentService } from '@root/persistent/persistent.interface';
import { sql } from 'slonik';
import {
  LatestTicker,
  TickerVwap,
  _void,
} from './vwap-calculator.repository.sql';

const INTERVAL = 5 * 60 * 1000;
export class VWAPCalculatorRepository {
  private readonly logger = new Logger(VWAPCalculatorRepository.name);

  constructor(
    @Inject(PersistentService)
    private readonly persistentService: PersistentService,
  ) {}

  async getLatestTickerFromDb(ticker: string) {
    return await this.persistentService.pgPool.any(sql<LatestTicker>`
        select * 
                from crypto_market.latest_vwap_history
                where ticker = ${ticker};`);
  }

  async processSavingVolumeInDb() {
    const currentTimestampInSeconds = Math.floor(Date.now() / 1000) * 1000;

    await this.persistentService.pgPool.transaction(async conn => {
      const vwaps = await conn.any(sql<TickerVwap>`
      with txs as (
        select *
                from crypto_market.transactions as ct
                  where ct.ts >= ${currentTimestampInSeconds - INTERVAL} )
                  select txs.ticker, sum(txs.price * txs.quantity) / sum(txs.quantity) as vwap 
                  from txs 
                  group by txs.ticker;`);

      for (const vwap of vwaps) {
        await this.persistentService.pgPool.query(sql<_void>`
                  insert into crypto_market.vwap_history
                      (ticker, ts, price, interval)
                  values (${vwap.ticker},
                          ${currentTimestampInSeconds},
                          ${vwap.vwap},
                          ${INTERVAL.toString()})
                  on conflict(ticker,ts) do nothing;`);

        await this.persistentService.pgPool.query(sql<_void>`
                  insert into crypto_market.latest_vwap_history
                      (ticker, ts, price, interval)
                  values (${vwap.ticker},
                          ${currentTimestampInSeconds},
                          ${vwap.vwap},
                          ${INTERVAL.toString()})
                  on conflict(ticker) do update set
                  ts = ${currentTimestampInSeconds},
                  price = ${vwap.vwap};`);

        this.logger.log(
          `Calculated and saving VWAP at timestamp : ${currentTimestampInSeconds}`,
        );
      }
    });
  }
}
