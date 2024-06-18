import { MigrationInterface, QueryRunner } from 'typeorm';

export class HotelMediaCreation1702626725422 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "hotel_medias" ( "id" BIGSERIAL PRIMARY KEY, "name" varchar NOT NULL, "url" varchar NOT NULL, "key" varchar NOT NULL, "type" varchar(100) NOT NULL, "hotel_id" int NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "hotel_medias_name_index" ON "hotel_medias" ("name")');
        await queryRunner.query('CREATE INDEX "hotel_medias_url_index" ON "hotel_medias" ("url")');
        await queryRunner.query('CREATE INDEX "hotel_medias_key_index" ON "hotel_medias" ("key")');
        await queryRunner.query('CREATE INDEX ON "hotel_medias" ("url", "key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "hotel_medias" CASCADE');
    }
}
