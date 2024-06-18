import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategoryCreation1702626397429 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "categories" ( "id" SERIAL PRIMARY KEY, "name" varchar(50) NOT NULL, "slug" varchar(75) NOT NULL, "description" varchar NULL, "url" varchar NULL, "key" varchar NULL, "is_active" smallint NOT NULL DEFAULT 1, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "categories_name_index" ON "categories" ("name")');
        await queryRunner.query('ALTER TABLE "categories" ADD CONSTRAINT "categories_slug_unique" UNIQUE("slug")');
        await queryRunner.query('CREATE INDEX "categories_url_index" ON "categories" ("url")');
        await queryRunner.query('CREATE INDEX "categories_key_index" ON "categories" ("key")');
        await queryRunner.query('CREATE INDEX ON "categories" ("url", "key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "categories" CASCADE');
    }
}
