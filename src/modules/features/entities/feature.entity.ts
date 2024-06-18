import { EntityHelper } from '@common/utils/entity-helper';
import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'features',
})
export class Feature extends EntityHelper {
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
}
