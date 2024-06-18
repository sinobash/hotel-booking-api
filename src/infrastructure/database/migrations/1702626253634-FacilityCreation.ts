import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacilityCreation1702626253634 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "facilities" ( "id" SERIAL PRIMARY KEY, "name" varchar(100) NOT NULL, "icon" varchar(50) NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "facility_name_index" ON "facilities" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "facilities"');
    }
}
