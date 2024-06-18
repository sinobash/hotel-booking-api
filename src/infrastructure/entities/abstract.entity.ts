import { EntityHelper } from '@common/utils/entity-helper';
import { Exclude } from 'class-transformer';
import { CreateDateColumn, UpdateDateColumn } from 'typeorm';

export abstract class AbstractEntity extends EntityHelper {
    /* creation time */
    @CreateDateColumn({
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamptz',
        comment: 'creation time',
    })
    @Exclude({ toPlainOnly: true })
    createdAt: Date;

    /* update time */
    @UpdateDateColumn({
        name: 'updated_at',
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamptz',
        comment: 'update time',
    })
    @Exclude({ toPlainOnly: true })
    updatedAt: Date;
}
