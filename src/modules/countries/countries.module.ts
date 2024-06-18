import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from './entities/country.entity';
import { CurrenciesModule } from '@modules/currencies/currencies.module';
import { CountriesService } from './countries.service';
import { AdminCountriesController } from './admin-countries.controller';
import { CountriesController } from './countries.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([Country]), RolesModule, CurrenciesModule],
    controllers: [AdminCountriesController, CountriesController],
    providers: [Logger, CountriesService],
    exports: [CountriesService],
})
export class CountriesModule {}
