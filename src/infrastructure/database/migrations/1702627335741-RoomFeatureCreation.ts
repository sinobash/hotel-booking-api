import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomFeatureCreation1702627335741 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "room_features" ( "id" SERIAL PRIMARY KEY, "name" varchar(100) NOT NULL, "icon" varchar(50) NOT null, "room_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "room_features_name_index" ON "room_features" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "room_features" CASCADE');
    }
}
