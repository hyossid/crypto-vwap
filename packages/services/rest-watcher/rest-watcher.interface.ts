export abstract class RestWatcherService {
  abstract startRestWatching(): Promise<any>;
  abstract processRestByTicker(ticker: string): Promise<void>;
}

export abstract class RestWatcherRepository {
  abstract getLatestValidatedTime(ticker: string): Promise<any>;
}
