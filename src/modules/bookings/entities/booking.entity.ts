import {
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    Relation,
} from 'typeorm';
import { DecimalTransformer } from '@common/transformers/decimal.transformer';
import { Guest } from '@modules/guests/entities/guest.entity';
import { Hotel } from '@modules/hotels/entities/hotel.entity';
import { Exclude } from 'class-transformer';
import { BookedRoom } from './booked-room.entity';
import { AbstractEntity } from '@infrastructure/entities/abstract.entity';

@Entity({
    name: 'bookings',
})
export class Booking extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'code',
        unique: true,
        length: 100,
        nullable: false,
    })
    @Index()
    code: string;

    @Column({
        name: 'room_count',
        default: 0,
        nullable: false,
    })
    roomCount: number;

    @Column({
        name: 'total_price',
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: false,
        default: 0.0,
        transformer: new DecimalTransformer(),
    })
    totalPrice: number;

    @Column({
        name: 'start_date',
        type: 'timestamptz',
        nullable: false,
    })
    @Index()
    startDate: Date;

    @Column({
        name: 'end_date',
        type: 'timestamptz',
        nullable: false,
    })
    @Index()
    endDate: Date;

    @ManyToOne(() => Hotel, (hotel) => hotel.bookings)
    hotel: Relation<Hotel>;

    @ManyToOne(() => Guest, (guest) => guest.bookings)
    guest: Relation<Guest>;

    @Column({
        name: 'status',
        nullable: false,
    })
    status: string;

    @OneToMany(() => BookedRoom, (bookedRooms) => bookedRooms.booking)
    bookedRooms: Relation<BookedRoom>[];

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
