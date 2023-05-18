import { Module } from '@nestjs/common';
import { PersistentModule } from '@root/persistent/persistent.module';
import { VWAPCalculatorRepository } from './vwap-calculator.repository';
import VWAPCalculatorProvider from './vwap-calculator.service';

@Module({
  imports: [PersistentModule],
  providers: [VWAPCalculatorRepository, VWAPCalculatorProvider],
  exports: [VWAPCalculatorProvider],
})
export class VWAPCalculatorModule {}
