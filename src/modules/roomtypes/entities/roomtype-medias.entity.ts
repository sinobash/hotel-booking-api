import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RoomType } from './roomtype.entity';

@Entity({
    name: 'room_type_medias',
})
export class RoomTypeMedia extends AbstractEntity {
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

    @ManyToOne(() => RoomType, (roomType) => roomType.medias)
    roomType: Relation<RoomType>;
}
