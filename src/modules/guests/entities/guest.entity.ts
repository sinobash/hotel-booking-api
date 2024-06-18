import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { MediaFile } from '@modules/files/entities/media-file.entity';
import { Exclude, Expose } from 'class-transformer';
import {
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from 'typeorm';
import { GuestDocument } from './guest-documents.entity';
import { Booking } from '@modules/bookings/entities/booking.entity';

@Entity({
    name: 'guests',
})
export class Guest extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
        name: 'id',
    })
    @Expose({
        name: 'guestId',
        toPlainOnly: true,
    })
    id: number;

    @Column({
        name: 'username',
        unique: true,
        length: 64,
        nullable: false,
    })
    @Expose({
        name: 'userName',
        toPlainOnly: true,
    })
    username: string;

    @Column({
        name: 'password',
        length: 72,
        type: String,
        nullable: true,
        // select: false, // This column will not be selected by find functions and  QueryBuilder
    })
    @Exclude({ toPlainOnly: true })
    password: string | null;

    @Column({
        name: 'email',
        unique: true,
        type: String,
        nullable: true,
    })
    @Expose({
        name: 'guestEmail',
        toPlainOnly: true,
    })
    email: string | null;

    @Column({
        name: 'phone_number',
        type: String,
        nullable: true,
    })
    @Index()
    phoneNumber: string | null;

    @Column({
        name: 'full_name',
        nullable: false,
    })
    fullName: string;

    @Column({
        name: 'is_verified',
        default: 0,
        nullable: false,
    })
    isVerified: number;

    @Column({
        name: 'is_active',
        default: 0,
        nullable: false,
    })
    isActive: number;

    @Column({
        name: 'last_login',
        type: 'timestamptz',
        nullable: true,
    })
    lastLogin: Date;

    @OneToOne(() => MediaFile)
    @JoinColumn()
    avatar?: Relation<MediaFile>;

    @OneToOne(() => GuestDocument)
    @JoinColumn()
    document?: Relation<GuestDocument>;

    @OneToMany(() => Booking, (bookings) => bookings.hotel)
    bookings: Relation<Booking>[];

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
