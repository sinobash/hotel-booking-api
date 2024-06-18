import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { User } from '@modules/users/entities/user.entity';
import { Exclude, Expose } from 'class-transformer';
import { Column, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Relation } from 'typeorm';
import { CapabilityProperties } from '../interfaces/capability-properties.interface';

@Entity({ name: 'roles' })
export class Role extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
    })
    @Expose({
        name: 'roleId',
        toPlainOnly: true,
    })
    id: number;

    @Column({
        name: 'alias',
        unique: true,
        nullable: false,
    })
    @Expose({
        name: 'roleAlias',
        toPlainOnly: true,
    })
    alias: string;

    @Column({
        name: 'name',
        nullable: false,
    })
    @Expose({
        name: 'roleName',
        toPlainOnly: true,
    })
    name: string;

    @Column({
        name: 'description',
        type: String,
        nullable: true,
    })
    @Expose({
        name: 'roleDesc',
        toPlainOnly: true,
    })
    description: string | null;

    @Column({
        name: 'capabilities',
        type: 'jsonb',
        nullable: true,
    })
    capabilities?: CapabilityProperties;

    @Exclude()
    @OneToMany(() => User, (user) => user.role)
    users: Relation<User>[];

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
