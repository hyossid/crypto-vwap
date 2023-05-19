import { TestingModule } from '@nestjs/testing';
import { createTestingModule } from '@root/testing/createTestingModule';
import { smoke } from '@root/testing/smoke';
import { WebSocketWatcherModule } from './websocket-watcher.module';
import { WebSocketWatcherRepository } from './websocket-watcher.repository';
const it = smoke(__filename);
describe('WebSocket Validator smoke testing', () => {
  let webSocketWatcherRepository: WebSocketWatcherRepository;
  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [WebSocketWatcherModule],
    });

    webSocketWatcherRepository = module.get(WebSocketWatcherRepository);
  });

  it('getLatestValidatedTimestamp', async () => {
    const ticker = 'BTC';
    const ts = 23423;
    await webSocketWatcherRepository.insertInitialValidationTime({
      ticker,
      ts,
    });
  });
});
