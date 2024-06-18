import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Hotel } from '@modules/hotels/entities/hotel.entity';
import { Exclude } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';

@Entity({ name: 'categories' })
export class Category extends AbstractEntity {
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
        name: 'slug',
        unique: true,
        nullable: false,
    })
    slug: string;

    @Column({
        name: 'description',
        type: String,
        nullable: true,
    })
    description: string | null;

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
        name: 'is_active',
        default: 1,
        nullable: false,
    })
    isActive: number;

    @Exclude()
    @OneToMany(() => Hotel, (hotel) => hotel.category)
    hotels: Relation<Hotel>[];

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
