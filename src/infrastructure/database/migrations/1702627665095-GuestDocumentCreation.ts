import { MigrationInterface, QueryRunner } from 'typeorm';

export class GuestDocumentCreation1702627665095 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "guest_document" ( "id" SERIAL PRIMARY KEY, "name" varchar NOT NULL, "url" varchar NOT NULL, "key" varchar NOT NULL, "type" varchar(100) NOT NULL, "is_verified" SMALLINT NOT NULL DEFAULT 0, "verified_by" int NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "guest_document_name_index" ON "guest_document" ("name")');
        await queryRunner.query('CREATE INDEX "guest_document_url_index" ON "guest_document" ("url")');
        await queryRunner.query('CREATE INDEX "guest_document_key_index" ON "guest_document" ("key")');
        await queryRunner.query('CREATE INDEX ON "guest_document" ("url", "key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "guest_document" CASCADE');
    }
}
