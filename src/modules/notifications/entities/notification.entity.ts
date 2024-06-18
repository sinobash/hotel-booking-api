import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
    name: 'notifications',
})
export class Notification extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
        name: 'id',
    })
    id: number;

    @Column({
        name: 'type',
        nullable: false,
    })
    @Index()
    type: string;

    @Column({
        name: 'sender_type',
        length: 100,
        nullable: false,
    })
    @Index()
    senderType: string;

    @Column({
        name: 'sender_key',
        length: 100,
        nullable: false,
    })
    @Index()
    senderKey: string;

    @Column({
        name: 'receiver_type',
        length: 100,
        nullable: false,
    })
    @Index()
    receiverType: string;

    @Column({
        name: 'receiver_key',
        length: 100,
        nullable: false,
    })
    @Index()
    receiverKey: string;

    @Column({
        name: 'data',
        type: 'jsonb',
        nullable: false,
    })
    data: object;

    @Column({
        name: 'read_at',
        type: 'timestamptz',
        nullable: true,
    })
    readAt: Date;

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
