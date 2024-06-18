import { MigrationInterface, QueryRunner } from 'typeorm';

export class StripeEventCreation1702628202857 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "stripe_events" ( "id" VARCHAR PRIMARY KEY NOT NULL, "payment_id" VARCHAR NULL, "booking_code" VARCHAR NULL, "amount" int NOT NULL DEFAULT 0, "amount_capturable" int NOT NULL DEFAULT 0, "amount_received" int NOT NULL DEFAULT 0, "created" TIMESTAMP WITH TIME ZONE NULL, "currency" VARCHAR NOT NULL, "metadata" JSONB NULL, "latest_charge" VARCHAR NOT NULL, "payment_method" VARCHAR NOT NULL, "payment_method_options" JSONB NULL, "payment_method_types" VARCHAR NULL, "status" VARCHAR NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "canceled_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "stripe_events_payment_id_index" ON "stripe_events" ("payment_id")');
        await queryRunner.query(
            'CREATE INDEX "stripe_events_metadata_index" ON "stripe_events" USING gin ("metadata")',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "stripe_events"');
    }
}
