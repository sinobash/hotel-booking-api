import { EntityHelper } from '@common/utils/entity-helper';
import { Hotel } from '@modules/hotels/entities/hotel.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RoomTypeFeatures } from './roomtype-features.entity';
import { RoomTypeMedia } from './roomtype-medias.entity';
import { DecimalTransformer } from '@common/transformers/decimal.transformer';
import { Room } from '@modules/rooms/entities/room.entity';

@Entity({
    name: 'room_types',
})
export class RoomType extends EntityHelper {
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
        name: 'price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0.0,
        transformer: new DecimalTransformer(),
    })
    price: number;

    @Column({
        name: 'capacity',
        type: 'smallint',
        nullable: false,
        default: 0,
    })
    capacity: number;

    @ManyToOne(() => Hotel, (hotel) => hotel.roomTypes)
    hotel: Relation<Hotel>;

    @OneToMany(() => RoomTypeFeatures, (roomTypeFeatures) => roomTypeFeatures.roomType)
    features: Relation<RoomTypeFeatures>[];

    @OneToMany(() => RoomTypeMedia, (roomTypeMedia) => roomTypeMedia.roomType)
    medias: Relation<RoomTypeMedia>[];

    @OneToMany(() => Room, (rooms) => rooms.roomType)
    rooms: Relation<Room>[];
}
