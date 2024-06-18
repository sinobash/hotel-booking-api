import { MigrationInterface, QueryRunner } from 'typeorm';

export class BillingCreation1702628093521 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "billings" ( "id" SERIAL PRIMARY KEY, "booking_code" varchar(100) UNIQUE NOT NULL, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "room_count" int NOT NULL DEFAULT 0, "total_price" decimal DEFAULT 0.0, "hotel_id" int NOT NULL, "room_type_id" int NOT NULL, "guest_id" int NOT NULL, "payment_id" varchar(100) NOT NULL, "payment_date" TIMESTAMP WITH TIME ZONE NULL, "status" varchar(15) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "billings_booking_code_index" ON "billings" ("booking_code")');
        await queryRunner.query('CREATE INDEX "billings_start_date_index" ON "billings" ("start_date")');
        await queryRunner.query('CREATE INDEX "billings_end_date_index" ON "billings" ("end_date")');
        await queryRunner.query('CREATE INDEX ON "billings" ("end_date", "start_date")');
        await queryRunner.query('CREATE INDEX "billings_payment_date_index" ON "billings" ("payment_date")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "billings" CASCADE');
    }
}
