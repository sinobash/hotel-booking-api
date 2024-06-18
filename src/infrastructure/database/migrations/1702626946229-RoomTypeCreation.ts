import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomTypeCreation1702626946229 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "room_types" ( "id" SERIAL PRIMARY KEY, "name" varchar(150) NOT NULL, "price" decimal DEFAULT 0.0, "capacity" smallint DEFAULT 0, "hotel_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "room_types_name_index" ON "room_types" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "room_types" CASCADE');
    }
}
