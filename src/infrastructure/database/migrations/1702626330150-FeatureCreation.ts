import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeatureCreation1702626330150 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "features" ( "id" SERIAL PRIMARY KEY, "name" varchar(100) NOT NULL, "icon" varchar(50) NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "features_name_index" ON "features" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "features"');
    }
}
