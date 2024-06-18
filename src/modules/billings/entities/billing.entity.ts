import { DecimalTransformer } from '@common/transformers/decimal.transformer';
import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Guest } from '@modules/guests/entities/guest.entity';
import { Hotel } from '@modules/hotels/entities/hotel.entity';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity({
    name: 'billings',
})
export class Billing extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'booking_code',
        unique: true,
        length: 100,
        nullable: false,
    })
    @Index()
    bookingCode: string;

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

    @ManyToOne(() => Hotel, (hotel) => hotel)
    hotel: Relation<Hotel>;

    @ManyToOne(() => RoomType, (roomType) => roomType)
    roomType: Relation<RoomType>;

    @ManyToOne(() => Guest, (guest) => guest)
    guest: Relation<Guest>;

    @Column({
        name: 'payment_id',
        length: 100,
        type: String,
        nullable: true,
    })
    paymentId: string | null;

    @Column({
        name: 'payment_date',
        type: 'timestamptz',
        nullable: true,
    })
    @Index()
    paymentDate: Date;

    @Column({
        name: 'status',
        nullable: false,
    })
    status: string;

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
