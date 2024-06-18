import { Logger, Module } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AdminDashboardController } from './admin-dashboard.controller';
import { BookingsModule } from '@modules/bookings/bookings.module';

@Module({
    imports: [BookingsModule],
    controllers: [AdminDashboardController],
    providers: [Logger, DashboardService],
    exports: [DashboardService],
})
export class DashboardModule {}
