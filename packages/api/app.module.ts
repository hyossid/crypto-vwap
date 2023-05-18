import { Module } from '@nestjs/common';
import { VWAPCalculatorModule } from '@root/services/vwap-calculator/vwap-calculator.module';
import { IndexController } from './controllers/index.controller';
import { VWAPController } from './controllers/vwap.controller';

@Module({
  imports: [VWAPCalculatorModule],
  controllers: [IndexController, VWAPController],
})
export class AppModule {}
