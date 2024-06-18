import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'banners' })
export class Banner extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    id: number;

    @Column({
        name: 'title',
        nullable: false,
    })
    title: string;

    @Column({
        name: 'description',
        type: String,
        nullable: true,
    })
    description: string | null;

    @Column({
        name: 'image_key',
        nullable: false,
    })
    imageKey: string;

    @Column({
        name: 'image_url',
        nullable: false,
    })
    imageUrl: string;

    @Column({
        name: 'link_url',
        type: String,
        nullable: true,
    })
    linkUrl: string | null;

    @Column({
        name: 'type',
        nullable: false,
    })
    type: string;
}
