import { TestingModule } from '@nestjs/testing';
import { createTestingModule } from '@root/testing/createTestingModule';
import { smoke } from '@root/testing/smoke';
import { RestWatcherService } from './rest-watcher.interface';
import { RestWatcherModule } from './rest-watcher.module';
import { RestWatcherRepository } from './rest-watcher.repository';

const it = smoke(__filename);
describe('Rest Validator smoke testing', () => {
  let restWatcherService: RestWatcherService;
  let restWatcherRepository: RestWatcherRepository;
  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [RestWatcherModule],
    });

    restWatcherService = module.get(RestWatcherService);
    restWatcherRepository = module.get(RestWatcherRepository);
  });

  it('Start', async () => {
    const ans = await restWatcherService.startRestWatching();
  });

  it('Ticker', async () => {
    const ticker = 'BTC';
    const ans = await restWatcherService.processRestByTicker(ticker);
    console.log(ans);
  });

  it('getLatestValidatedTimestamp', async () => {
    const ticker = 'BTC';
    const test = await restWatcherRepository.getLatestValidatedTime(ticker);
    console.log(test);
  });
});
