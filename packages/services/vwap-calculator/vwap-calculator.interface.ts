export abstract class RestWatcherService {
  abstract startRestWatching(options: { once: boolean }): Promise<void>;
}
