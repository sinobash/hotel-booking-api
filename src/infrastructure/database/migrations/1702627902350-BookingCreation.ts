import { MigrationInterface, QueryRunner } from 'typeorm';

export class BookingCreation1702627902350 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "bookings" ( "id" SERIAL PRIMARY KEY, "code" varchar(100) UNIQUE NOT NULL, "room_count" int NOT NULL DEFAULT 0, "total_price" decimal DEFAULT 0.0, "start_date" TIMESTAMP WITH TIME ZONE NOT NULL, "end_date" TIMESTAMP WITH TIME ZONE NOT NULL, "hotel_id" int NOT NULL, "guest_id" int NOT NULL, "status" varchar(50) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "bookings_code_index" ON "bookings" ("code")');
        await queryRunner.query('CREATE INDEX "bookings_start_date_index" ON "bookings" ("start_date")');
        await queryRunner.query('CREATE INDEX "bookings_end_date_index" ON "bookings" ("end_date")');
        await queryRunner.query('CREATE INDEX ON "bookings" ("end_date", "start_date")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "bookings" CASCADE');
    }
}
