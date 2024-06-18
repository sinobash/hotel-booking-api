import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationCreation1702628274619 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "notifications"( "id" BIGSERIAL PRIMARY KEY, "type" VARCHAR NOT NULL, "sender_type" VARCHAR(100) NOT NULL, "sender_key" VARCHAR(100) NOT NULL, "receiver_type" VARCHAR(100) NOT NULL, "receiver_key" VARCHAR(100) NOT NULL, "data" JSONB NOT NULL, "read_at" TIMESTAMP WITH TIME ZONE NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL, "deleted_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "notifications_type_index" ON "notifications" ("type")');
        await queryRunner.query('CREATE INDEX "notifications_sender_type" ON "notifications" ("sender_type")');
        await queryRunner.query('CREATE INDEX "notifications_sender_key" ON "notifications" ("sender_key")');
        await queryRunner.query('CREATE INDEX ON "notifications" ("sender_type", "sender_key")');
        await queryRunner.query('CREATE INDEX "notifications_receiver_type" ON "notifications" ("receiver_type")');
        await queryRunner.query('CREATE INDEX "notifications_receiver_key" ON "notifications" ("receiver_key")');
        await queryRunner.query('CREATE INDEX ON "notifications" ("receiver_type", "receiver_key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "notifications"');
    }
}
