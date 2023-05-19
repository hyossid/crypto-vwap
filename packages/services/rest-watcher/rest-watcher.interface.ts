export abstract class RestWatcherService {
  abstract startRestWatching(): Promise<any>;
  abstract processRestByTicker(ticker: string): Promise<void>;
}
