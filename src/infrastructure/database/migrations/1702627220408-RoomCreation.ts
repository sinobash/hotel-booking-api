import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomCreation1702627220408 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "rooms" ( "id" SERIAL PRIMARY KEY, "code" varchar(15) NOT NULL, "is_available" smallint NOT NULL DEFAULT 1, "room_type_id" int NOT NULL, "floor_number" smallint NOT NULL DEFAULT 1, "bed_type" VARCHAR(20) NOT NULL, "house_keeping_status" VARCHAR(100) NOT NULL )',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "rooms" CASCADE');
    }
}
