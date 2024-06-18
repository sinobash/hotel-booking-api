import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'media_files' })
export class MediaFile extends AbstractEntity {
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
}
