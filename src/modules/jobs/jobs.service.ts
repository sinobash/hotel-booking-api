import { BillingsService } from '@modules/billings/billings.service';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class JobsService {
    constructor(
        private readonly logger: Logger,
        private readonly billingsService: BillingsService,
    ) {}

    @Cron(CronExpression.EVERY_5_MINUTES)
    async handleFailedBookingPayment() {
        await this.billingsService.updatePendingPayment();
    }
}
