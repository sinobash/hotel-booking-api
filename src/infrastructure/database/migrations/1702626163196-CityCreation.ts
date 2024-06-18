import { MigrationInterface, QueryRunner } from 'typeorm';

export class CityCreation1702626163196 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "cities" ( "id" SERIAL PRIMARY KEY, "name" varchar(100) NOT NULL, "latitude" decimal(10, 8), "longitude" decimal(11, 8), "country_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "city_name_index" ON "cities" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "cities" CASCADE');
    }
}
