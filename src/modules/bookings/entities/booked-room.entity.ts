import { EntityHelper } from '@common/utils/entity-helper';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Booking } from './booking.entity';
import { Room } from '@modules/rooms/entities/room.entity';
import { DecimalTransformer } from '@common/transformers/decimal.transformer';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';

@Entity({
    name: 'booked_room',
})
export class BookedRoom extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @ManyToOne(() => Booking, (booking) => booking.bookedRooms)
    booking: Relation<Booking>;

    @ManyToOne(() => RoomType, (roomType) => roomType)
    roomType: Relation<RoomType>;

    @ManyToOne(() => Room, (room) => room)
    room: Relation<Room>;

    @Column({
        name: 'current_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0.0,
        transformer: new DecimalTransformer(),
    })
    currentPrice: number;

    @Column({
        name: 'checkin_at',
        type: 'timestamptz',
        nullable: true,
    })
    @Index()
    checkInAt: Date;

    @Column({
        name: 'checkout_at',
        type: 'timestamptz',
        nullable: true,
    })
    @Index()
    checkOutAt: Date;
}
