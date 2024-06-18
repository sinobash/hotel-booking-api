import { EntityHelper } from '@common/utils/entity-helper';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RoomFeatures } from './room-features.entity';
import { BookedRoom } from '@modules/bookings/entities/booked-room.entity';

@Entity({
    name: 'rooms',
})
export class Room extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'code',
        nullable: false,
    })
    code: string;

    @Column({
        name: 'is_available',
        default: 1,
        nullable: false,
    })
    isAvailable: number;

    @ManyToOne(() => RoomType, (roomType) => roomType.rooms)
    roomType: Relation<RoomType>;

    @Column({
        name: 'floor_number',
        default: 1,
        nullable: false,
    })
    floorNumber: number;

    @Column({
        name: 'bed_type',
        type: String,
        nullable: true,
    })
    bedType: string | null;

    @Column({
        name: 'house_keeping_status',
        nullable: false,
    })
    houseKeepingStatus: string;

    @OneToMany(() => RoomFeatures, (roomFeatures) => roomFeatures.room)
    features: Relation<RoomFeatures>[];

    @OneToMany(() => BookedRoom, (bookedRooms) => bookedRooms.room)
    bookedRooms: Relation<BookedRoom>[];
}
