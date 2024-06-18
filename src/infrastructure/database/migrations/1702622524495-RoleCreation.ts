import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoleCreation1702622524495 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "roles"( "id" SERIAL PRIMARY KEY, "alias" VARCHAR(25) NOT NULL, "name" VARCHAR(50) NOT NULL, "description" VARCHAR(255) NULL, "capabilities" JSONB NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('ALTER TABLE "roles" ADD CONSTRAINT "roles_alias_unique" UNIQUE("alias")');
        await queryRunner.query('CREATE INDEX "roles_capabilities_index" ON "roles" USING gin ("capabilities")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "roles" CASCADE');
    }
}
