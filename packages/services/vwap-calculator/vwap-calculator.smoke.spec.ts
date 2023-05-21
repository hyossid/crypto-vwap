import { TestingModule } from '@nestjs/testing';
import { createTestingModule } from '@root/testing/createTestingModule';
import { smoke } from '@root/testing/smoke';
import { VWAPCalculatorService } from './vwap-calculator.interface';
import { VWAPCalculatorModule } from './vwap-calculator.module';
const it = smoke(__filename);
describe('VWAP Calculator smoke testing', () => {
  let vwapCalculatorService: VWAPCalculatorService;
  beforeAll(async () => {
    const module: TestingModule = await createTestingModule({
      imports: [VWAPCalculatorModule],
    });

    vwapCalculatorService = module.get(VWAPCalculatorService);
  });

  it('getHistoricalTicker', async () => {
    const ticker = 'BTC';
    const ts = 1684657334000; // custom
    await vwapCalculatorService.getHistoricalTicker(ticker, ts);
  });
});
