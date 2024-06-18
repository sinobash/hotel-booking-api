import { MigrationInterface, QueryRunner } from 'typeorm';

export class HotelCreation1702626525322 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "hotels" ( "id" SERIAL PRIMARY KEY, "code" varchar(20) UNIQUE NOT NULL, "name" varchar(150) NOT NULL, "description" varchar, "address" varchar, "latitude" decimal(10, 8), "longitude" decimal(11, 8), "geohash" varchar(50), "is_active" smallint NOT NULL DEFAULT 1, "category_id" int NOT NULL, "city_id" int NOT NULL )',
        );
        await queryRunner.query('CREATE INDEX "hotel_name_index" ON "hotels" ("name")');
        await queryRunner.query('CREATE INDEX ON "hotels" ("latitude")');
        await queryRunner.query('CREATE INDEX ON "hotels" ("longitude")');
        await queryRunner.query('CREATE INDEX ON "hotels" ("latitude", "longitude")');
        await queryRunner.query('CREATE INDEX "hotel_geohash_index" ON "hotels" ("geohash")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "hotels" CASCADE');
    }
}
