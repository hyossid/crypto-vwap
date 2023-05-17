export abstract class WebSocketWatcherService {
  abstract startWebSocketWatching(): Promise<void>;
}

export interface RawTransaction {
  ts: number;
  ticker: string;
  quantity: number;
  price: number;
  tradeid: string;
}
