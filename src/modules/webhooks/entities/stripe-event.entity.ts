import { EntityHelper } from '@common/utils/entity-helper';
import { Column, CreateDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({
    name: 'stripe_events',
})
class StripeEvent extends EntityHelper {
    @PrimaryColumn()
    public id: string;

    @Column({
        name: 'payment_id',
        type: String,
        nullable: true,
    })
    @Index()
    paymentId: string | null;

    @Column({
        name: 'booking_code',
        nullable: false,
    })
    bookingCode: string;

    @Column({
        name: 'amount',
        default: 0,
        nullable: false,
    })
    amount: number;

    @Column({
        name: 'amount_capturable',
        default: 0,
        nullable: false,
    })
    amountCapturable: number;

    @Column({
        name: 'amount_received',
        default: 0,
        nullable: false,
    })
    amountReceived: number;

    @Column({
        name: 'created',
        type: 'timestamptz',
        nullable: true,
    })
    created: Date;

    @Column({
        name: 'currency',
        nullable: false,
    })
    currency: string;

    @Column({
        name: 'metadata',
        type: 'jsonb',
        nullable: true,
    })
    metadata?: object;

    @Column({
        name: 'latest_charge',
        nullable: false,
    })
    latestCharge: string;

    @Column({
        name: 'payment_method',
        nullable: false,
    })
    paymentMethod: string;

    @Column({
        name: 'payment_method_options',
        type: 'jsonb',
        nullable: true,
    })
    paymentMethodOptions?: object;

    @Column('simple-array', {
        name: 'payment_method_types',
        nullable: true,
    })
    paymentMethodTypes: string[];

    @Column({
        name: 'status',
        nullable: false,
    })
    status: string;

    /* creation time */
    @CreateDateColumn({
        name: 'created_at',
        default: () => 'CURRENT_TIMESTAMP',
        type: 'timestamptz',
        comment: 'creation time',
    })
    createdAt: Date;

    @Column({
        name: 'canceled_at',
        type: 'timestamptz',
        nullable: true,
    })
    canceledAt: Date;
}

export default StripeEvent;
