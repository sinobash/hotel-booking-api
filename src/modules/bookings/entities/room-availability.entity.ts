import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Hotel } from '@modules/hotels/entities/hotel.entity';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';
import { Room } from '@modules/rooms/entities/room.entity';

@Entity({
    name: 'room_availabilities',
})
export class RoomAvailability extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @ManyToOne((type) => Hotel)
    hotel: Relation<Hotel>;

    @ManyToOne((type) => RoomType)
    roomType: Relation<RoomType>;

    @ManyToOne((type) => Room)
    room?: Relation<Room>;

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
