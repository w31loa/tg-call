import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [TelegramService],
  controllers: [TelegramController],
  exports: [TelegramService]
})
export class TelegramModule {}
 