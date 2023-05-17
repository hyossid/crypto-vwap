import { Module } from '@nestjs/common';
import { IndexController } from './controllers/index.controller';

@Module({
  imports: [],
  controllers: [IndexController],
})
export class AppModule {}
