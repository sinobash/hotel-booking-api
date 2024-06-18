import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { EntityHelper } from '@common/utils/entity-helper';
import { Booking } from './booking.entity';
import { Room } from '@modules/rooms/entities/room.entity';

@Entity({
    name: 'occupied_room',
})
export class OccupiedRoom extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @ManyToOne(() => Booking, (booking) => booking)
    booking: Relation<Booking>;

    @ManyToOne(() => Room, (room) => room)
    room: Relation<Room>;

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
