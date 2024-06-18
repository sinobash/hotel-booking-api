import { MigrationInterface, QueryRunner } from 'typeorm';

export class CountryCreation1702626085737 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "countries" ( "id" SERIAL PRIMARY KEY, "code" varchar(10) UNIQUE NOT NULL, "name" varchar(100) NOT NULL, "phone_code" varchar(10) NOT NULL, "latitude" decimal(10, 8), "longitude" decimal(11, 8), "currency_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "country_name_index" ON "countries" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "countries" CASCADE');
    }
}
