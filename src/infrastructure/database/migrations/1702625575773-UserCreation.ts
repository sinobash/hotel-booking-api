import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserCreation1702625575773 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "users"( "id" SERIAL PRIMARY KEY, "username" VARCHAR(64) NOT NULL, "code_word" VARCHAR(72) NOT NULL, "code_hash" VARCHAR(255) NULL, "email" VARCHAR(255) NOT NULL, "full_name" VARCHAR(255) NOT NULL, "phone_number" VARCHAR(32) NULL, "gender" SMALLINT NOT NULL DEFAULT 0, "is_active" SMALLINT NOT NULL DEFAULT 0, "last_login" TIMESTAMP WITH TIME ZONE NULL, "role_id" int NOT NULL, "hotel_id" int NULL, "avatar_id" int NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username")');
        await queryRunner.query('ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email")');
        await queryRunner.query('CREATE INDEX "IDX_e282acb94d2e3aec10f480e4f6" ON "users" ("code_hash")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "users" CASCADE');
    }
}
