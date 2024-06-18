import { MigrationInterface, QueryRunner } from 'typeorm';

export class GuestCreation1702627522315 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "guests" ( "id" SERIAL PRIMARY KEY, "username" VARCHAR(64) NOT NULL, "password" VARCHAR(72) NULL, "email" VARCHAR(255) NULL, "phone_number" VARCHAR(64) NULL, "full_name" VARCHAR(255) NOT NULL, "is_verified" SMALLINT NOT NULL DEFAULT 0, "is_active" SMALLINT NOT NULL DEFAULT 0, "last_login" TIMESTAMP WITH TIME ZONE NULL, "avatar_id" int NULL, "document_id" int NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('ALTER TABLE "guests" ADD CONSTRAINT "guests_username_unique" UNIQUE("username")');
        await queryRunner.query('ALTER TABLE "guests" ADD CONSTRAINT "guests_email_unique" UNIQUE("email")');
        await queryRunner.query('CREATE INDEX "IDX_e282ac6y7dl9eaec10f480e4f6" ON "guests" ("phone_number")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "guests" CASCADE');
    }
}
