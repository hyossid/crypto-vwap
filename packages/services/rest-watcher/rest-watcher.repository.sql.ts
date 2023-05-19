export interface TransactionsSchema {
  ticker: string;
  tradeid: string;
  ts: number;
  quantity: number;
  price: number;
}

export interface Ticker {
  ticker: string;
}

export interface TickersValidationTimestamp {
  ticker: string;
  validated_until: number;
}
