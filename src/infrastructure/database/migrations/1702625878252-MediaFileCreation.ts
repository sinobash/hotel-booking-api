import { MigrationInterface, QueryRunner } from 'typeorm';

export class MediaFileCreation1702625878252 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "media_files" ( "id" BIGSERIAL PRIMARY KEY, "name" varchar NOT NULL, "url" varchar NOT NULL, "key" varchar NOT NULL, "type" varchar(100) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "media_name_index" ON "media_files" ("name")');
        await queryRunner.query('CREATE INDEX "media_url_index" ON "media_files" ("url")');
        await queryRunner.query('CREATE INDEX "media_key_index" ON "media_files" ("key")');
        await queryRunner.query('CREATE INDEX ON "media_files" ("url", "key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "media_files" CASCADE');
    }
}
