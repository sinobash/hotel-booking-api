import { EntityHelper } from '@common/utils/entity-helper';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { Room } from './room.entity';

@Entity({
    name: 'room_features',
})
export class RoomFeatures extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'name',
        nullable: false,
    })
    @Index()
    name: string;

    @Column({
        name: 'icon',
        nullable: false,
    })
    icon: string;

    @ManyToOne(() => Room, (room) => room.features)
    room: Relation<Room>;
}
