import { LatestTicker } from './vwap-calculator.repository.sql';

export abstract class VWAPCalculatorService {
  abstract getLatestTicker(ticker: string): Promise<readonly LatestTicker[]>;
  abstract getHistoricalTicker(
    ticker: string,
    ts: number,
  ): Promise<readonly LatestTicker[]>;
  abstract startCalculateVWAPfromDB(): Promise<void>;
}
