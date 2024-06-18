import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { City } from './entities/city.entity';
import { CountriesModule } from '@modules/countries/countries.module';
import { CitiesService } from './cities.service';
import { AdminCitiesController } from './admin-cities.controller';
import { CitiesController } from './cities.controller';
import { RolesModule } from '@modules/roles/roles.module';

@Module({
    imports: [TypeOrmModule.forFeature([City]), RolesModule, CountriesModule],
    controllers: [AdminCitiesController, CitiesController],
    providers: [Logger, CitiesService],
    exports: [CitiesService],
})
export class CitiesModule {}
