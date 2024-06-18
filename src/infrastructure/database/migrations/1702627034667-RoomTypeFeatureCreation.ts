import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomTypeFeatureCreation1702627034667 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "room_type_features" ( "id" SERIAL PRIMARY KEY, "name" varchar(100) NOT NULL, "icon" varchar(50) NOT NULL, "room_type_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "room_type_features_name_index" ON "room_type_features" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "room_type_features" CASCADE');
    }
}
