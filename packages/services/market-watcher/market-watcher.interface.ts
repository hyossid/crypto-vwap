export abstract class MarketWatcherService {
  abstract start(feat: { websocket: boolean; trades: boolean }): Promise<void>;
}
