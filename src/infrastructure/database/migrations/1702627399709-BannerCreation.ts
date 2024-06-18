import { MigrationInterface, QueryRunner } from 'typeorm';

export class BannerCreation1702627399709 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "banners" ( "id" SERIAL PRIMARY KEY, "title" varchar NOT NULL, "description" varchar NULL, "image_key" varchar NOT NULL, "image_url" varchar NOT NULL, "link_url" varchar NOT NULL, "type" varchar NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "banners_title_index" ON "banners" ("title")');
        await queryRunner.query('CREATE INDEX "banners_link_url_index" ON "banners" ("link_url")');
        await queryRunner.query('CREATE INDEX "banners_image_url_index" ON "banners" ("image_url")');
        await queryRunner.query('CREATE INDEX "banners_image_key_index" ON "banners" ("image_key")');
        await queryRunner.query('CREATE INDEX ON "banners" ("image_url", "image_key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "banners"');
    }
}
