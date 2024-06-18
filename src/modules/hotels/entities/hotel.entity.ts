import { EntityHelper } from '@common/utils/entity-helper';
import { City } from '@modules/cities/entities/city.entity';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { HotelFacilities } from './hotel-facilities.entity';
import { HotelMedia } from './hotel-medias.entity';
import { RoomType } from '@modules/roomtypes/entities/roomtype.entity';
import { Booking } from '@modules/bookings/entities/booking.entity';
import { HotelCategoryType } from '@common/enums/category.enum';
import { Category } from '@modules/categories/entities/category.entity';

@Entity({
    name: 'hotels',
})
export class Hotel extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'code',
        unique: true,
        nullable: false,
    })
    code: string;

    @Column({
        name: 'name',
        nullable: false,
    })
    name: string;

    @Column({
        name: 'description',
        type: String,
        nullable: true,
    })
    description: string | null;

    @Column({
        name: 'address',
        type: String,
        nullable: true,
    })
    address: string | null;

    @Column({
        name: 'latitude',
        type: String,
        nullable: true,
    })
    latitude: string | null;

    @Column({
        name: 'longitude',
        type: String,
        nullable: true,
    })
    longitude: string | null;

    @Column({
        name: 'geohash',
        type: String,
        nullable: true,
    })
    geohash: string | null;

    @Column({
        name: 'is_active',
        default: 1,
        nullable: false,
    })
    isActive: number;

    @ManyToOne(() => Category, (category) => category.id)
    category: Category;

    @ManyToOne(() => City, (city) => city.id)
    city: City;

    @OneToMany(() => HotelFacilities, (hotelFacilities) => hotelFacilities.hotel)
    facilities: Relation<HotelFacilities>[];

    @OneToMany(() => HotelMedia, (hotelMedias) => hotelMedias.hotel)
    medias: Relation<HotelMedia>[];

    @OneToMany(() => RoomType, (roomTypes) => roomTypes.hotel)
    roomTypes: Relation<RoomType>[];

    @OneToMany(() => Booking, (bookings) => bookings.hotel)
    bookings: Relation<Booking>[];
}
