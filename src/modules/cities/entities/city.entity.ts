import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Country } from '@modules/countries/entities/country.entity';
import { EntityHelper } from '@common/utils/entity-helper';

@Entity({
    name: 'cities',
})
export class City extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'name',
        nullable: false,
    })
    name: string;

    @Column({
        name: 'latitude',
        type: String,
        nullable: true,
    })
    latitude: string | null;

    @Column({
        name: 'longitude',
        type: String,
        nullable: true,
    })
    longitude: string | null;

    @ManyToOne(() => Country, (country) => country.id)
    country: Country;
}
