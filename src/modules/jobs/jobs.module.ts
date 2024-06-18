import { Logger, Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { BillingsModule } from '@modules/billings/billings.module';

@Module({
    imports: [BillingsModule],
    providers: [Logger, JobsService],
    exports: [JobsService],
})
export class JobsModule {}
