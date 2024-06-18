import { MigrationInterface, QueryRunner } from 'typeorm';

export class CurrencyCreation1702626011622 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "currencies" ( "id" SERIAL PRIMARY KEY, "code" varchar(10) NOT NULL, "symbol" varchar(5) NOT NULL, "description" varchar(255), "decimal_place" int NOT NULL DEFAULT 2, "is_default" smallint NOT NULL DEFAULT 0 )',
        );
        await queryRunner.query('CREATE INDEX "currencies_code_index" ON "currencies" ("code")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "currencies" CASCADE');
    }
}
