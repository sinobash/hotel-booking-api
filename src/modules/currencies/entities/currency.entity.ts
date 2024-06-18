import { EntityHelper } from '@common/utils/entity-helper';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'currencies',
})
export class Currency extends EntityHelper {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'code',
        nullable: false,
    })
    code: string;

    @Column({
        name: 'symbol',
        nullable: false,
    })
    symbol: string;

    @Column({
        name: 'description',
        nullable: false,
    })
    description: string;

    @Column({
        name: 'decimal_place',
        nullable: false,
    })
    decimalPlace: number;

    @Column({
        name: 'is_default',
        nullable: false,
    })
    isDefault: number;
}
