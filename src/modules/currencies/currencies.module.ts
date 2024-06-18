import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { CurrenciesService } from './currencies.service';
import { AdminCurrenciesController } from './admin-currencies.controller';
import { CurrenciesController } from './currencies.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Currency]), RolesModule],
    controllers: [AdminCurrenciesController, CurrenciesController],
    providers: [Logger, CurrenciesService],
    exports: [CurrenciesService],
})
export class CurrenciesModule {}
