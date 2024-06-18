import { EntityHelper } from '@common/utils/entity-helper';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity({
    name: 'hotel_facilities',
})
export class HotelFacilities extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'name',
        nullable: false,
    })
    @Index()
    name: string;

    @Column({
        name: 'icon',
        nullable: false,
    })
    icon: string;

    @ManyToOne(() => Hotel, (hotel) => hotel.facilities)
    hotel: Relation<Hotel>;
}
