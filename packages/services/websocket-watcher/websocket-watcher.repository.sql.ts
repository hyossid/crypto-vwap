export interface TransactionsSchema {
  ticker: string;
  tradeid: string;
  ts: number;
  quantity: number;
  price: number;
}
export interface TickersValidationTimestamp {
  ticker: string;
  ts: number;
}
export interface TickerSchema {
  ticker: string;
}
