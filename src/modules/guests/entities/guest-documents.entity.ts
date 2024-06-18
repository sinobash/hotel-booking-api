import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'guest_document',
})
export class GuestDocument extends AbstractEntity {
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

    @Column({
        name: 'is_verified',
        default: 0,
        nullable: false,
    })
    isVerified: number;

    @Column({
        name: 'verified_by',
        default: 0,
        nullable: false,
    })
    verifiedBy: number;

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
