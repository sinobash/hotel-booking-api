import { EntityHelper } from '@common/utils/entity-helper';
import { Currency } from '@modules/currencies/entities/currency.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity({
    name: 'countries',
})
export class Country extends EntityHelper {
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
        name: 'phone_code',
        nullable: false,
    })
    phoneCode: string;

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

    @OneToOne(() => Currency)
    @JoinColumn()
    currency: Relation<Currency>;
}
