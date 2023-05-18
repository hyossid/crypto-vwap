export interface TransactionsSchema {
  ticker: string;
  tradeid: string;
  ts: number;
  quantity: number;
  price: number;
}

export interface TickerVwap {
  ticker: string;
  vwap: number;
}

export interface LatestTicker {
  ticker: string;
  ts: number;
  price: number;
  interval: string;
}

export type _void = Record<string, never>;
