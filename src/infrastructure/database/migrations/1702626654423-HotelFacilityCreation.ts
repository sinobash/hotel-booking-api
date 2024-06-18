import { MigrationInterface, QueryRunner } from 'typeorm';

export class HotelFacilityCreation1702626654423 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "hotel_facilities" ( "id" SERIAL PRIMARY KEY, "name" varchar(100) NOT NULL, "icon" varchar(50) NOT null, "hotel_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "hotel_facilities_name_index" ON "hotel_facilities" ("name")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "hotel_facilities" CASCADE');
    }
}
