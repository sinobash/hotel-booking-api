import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Hotel } from './hotel.entity';

@Entity({
    name: 'hotel_medias',
})
export class HotelMedia extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
        name: 'id',
    })
    id: number;

    @Column({
        name: 'name',
        nullable: false,
    })
    name: string;

    @Column({
        name: 'url',
        nullable: false,
    })
    url: string;

    @Column({
        name: 'key',
        nullable: false,
    })
    key: string;

    @Column({
        name: 'type',
        nullable: false,
    })
    type: string;

    @ManyToOne(() => Hotel, (hotel) => hotel.medias)
    hotel: Relation<Hotel>;
}
