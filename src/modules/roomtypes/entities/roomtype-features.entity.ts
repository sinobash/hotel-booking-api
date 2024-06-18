import { EntityHelper } from '@common/utils/entity-helper';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { RoomType } from './roomtype.entity';

@Entity({
    name: 'room_type_features',
})
export class RoomTypeFeatures extends EntityHelper {
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

    @ManyToOne(() => RoomType, (roomType) => roomType.features)
    roomType: Relation<RoomType>;
}
