export abstract class MarketWatcherService {
  abstract start(feat: {
    websocket: boolean;
    rest: boolean;
    vwapdb: boolean;
  }): Promise<void>;
}
