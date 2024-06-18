import { MigrationInterface, QueryRunner } from 'typeorm';

export class BookedRoomCreation1702628000738 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "booked_room" ( "id" SERIAL PRIMARY KEY, "booking_id" int NOT NULL, "room_type_id" int NOT NULL, "room_id" int NULL, "current_price" decimal DEFAULT 0.0, "checkin_at" TIMESTAMP WITH TIME ZONE NULL, "checkout_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "booked_room_checkin_at_index" ON "booked_room" ("checkin_at")');
        await queryRunner.query('CREATE INDEX "booked_room_checkout_at_index" ON "booked_room" ("checkout_at")');
        await queryRunner.query('CREATE INDEX ON "booked_room" ("checkout_at", "checkin_at")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "booked_room" CASCADE');
    }
}
