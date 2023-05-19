import { TestingModule } from '@nestjs/testing';
import { createTestingModule } from '@root/testing/createTestingModule';
import { smoke } from '@root/testing/smoke';
import { RestWatcherService } from './rest-watcher.interface';
import { RestWatcherModule } from './rest-watcher.module';

const it = smoke(__filename);
describe('Rest Validator smoke testing', () => {
  let restWatcherService: RestWatcherService;

  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [RestWatcherModule],
    });

    restWatcherService = module.get(RestWatcherService);
  });

  it('Test for API fetching', async () => {
    const ticker = 'BTC';
    await restWatcherService.processRestByTicker(ticker);
  });
});
