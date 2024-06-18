import { AbstractEntity } from '@infrastructure/entities/abstract.entity';
import { Exclude, Expose } from 'class-transformer';
import {
    AfterLoad,
    BeforeInsert,
    BeforeUpdate,
    Column,
    DeleteDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    Relation,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Role } from '@modules/roles/entities/role.entity';
import { Hotel } from '@modules/hotels/entities/hotel.entity';
import { MediaFile } from '@modules/files/entities/media-file.entity';

@Entity({
    name: 'users',
})
export class User extends AbstractEntity {
    @PrimaryGeneratedColumn('identity', {
        generatedIdentity: 'ALWAYS',
        name: 'id',
    })
    @Expose({
        name: 'userId',
        toPlainOnly: true,
    })
    id: number;

    // For "string | null" we need to use String type.
    // More info: https://github.com/typeorm/typeorm/issues/2567
    @Column({
        name: 'username',
        unique: true,
        length: 64,
        nullable: false,
    })
    @Expose({
        name: 'userName',
        toPlainOnly: true,
    })
    username: string;

    @Column({
        name: 'code_word',
        length: 72,
        nullable: false,
        // select: false, // This column will not be selected by find functions and  QueryBuilder
    })
    @Exclude({ toPlainOnly: true })
    codeWord: string;

    @Exclude({ toPlainOnly: true })
    public previousPassword: string;

    @AfterLoad()
    public loadPreviousPassword(): void {
        this.previousPassword = this.codeWord;
    }

    @BeforeInsert()
    @BeforeUpdate()
    async setPassword() {
        if (this.previousPassword !== this.codeWord && this.codeWord) {
            const saltOrRounds = 12;
            const salt = await bcrypt.genSalt(saltOrRounds);
            this.codeWord = await bcrypt.hash(this.codeWord, salt);
        }
    }

    @Column({
        name: 'code_hash',
        type: String,
        nullable: true,
    })
    @Index()
    @Exclude({ toPlainOnly: true })
    codeHash: string | null;

    @Column({
        name: 'email',
        unique: true,
        nullable: false,
    })
    @Expose({
        name: 'userEmail',
        toPlainOnly: true,
    })
    email: string;

    @Column({
        name: 'full_name',
        default: 'Your Full Name',
        nullable: false,
    })
    fullName: string;

    @Column({
        name: 'phone_number',
        type: String,
        nullable: true,
    })
    phoneNumber: string | null;

    @Column({
        name: 'gender',
        default: 0,
        nullable: false,
    })
    @Expose({
        name: 'userGender',
        toPlainOnly: true,
    })
    gender: number;

    @Column({
        name: 'is_active',
        comment: 'User Active or Inactive',
        default: 0,
        nullable: false,
    })
    @Expose({
        name: 'userActive',
        toPlainOnly: true,
    })
    isActive: number;

    @Column({
        name: 'last_login',
        type: 'timestamptz',
        nullable: true,
    })
    lastLogin: Date;

    @Exclude({ toPlainOnly: true })
    @ManyToOne(() => Role, (role) => role.users)
    role: Relation<Role>;

    @OneToOne(() => Hotel)
    @JoinColumn()
    hotel?: Relation<Hotel>;

    @OneToOne(() => MediaFile)
    @JoinColumn()
    avatar?: Relation<MediaFile>;

    /* deletion time */
    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'timestamptz',
        comment: 'deletion time',
    })
    @Exclude({ toPlainOnly: true })
    deletedAt: Date;
}
