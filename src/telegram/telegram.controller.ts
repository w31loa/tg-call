import { Controller, Get } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { throws } from 'assert';
import { CHANNELS_ENUM } from './types/channels.enum';

@Controller('telegram')
export class TelegramController {

    constructor(private readonly telegram:TelegramService){}

    @Get('')
    parse(){
        return this.telegram.testCall()
    }



}
