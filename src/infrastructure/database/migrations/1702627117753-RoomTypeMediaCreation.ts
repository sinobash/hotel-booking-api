import { MigrationInterface, QueryRunner } from 'typeorm';

export class RoomTypeMediaCreation1702627117753 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'CREATE TABLE IF NOT EXISTS "room_type_medias" ( "id" BIGSERIAL PRIMARY KEY, "name" varchar NOT NULL, "url" varchar NOT NULL, "key" varchar NOT NULL, "type" varchar(100) NOT NULL, "room_type_id" int NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now()), "updated_at" TIMESTAMP WITH TIME ZONE NULL )',
        );
        await queryRunner.query('CREATE INDEX "room_type_medias_name_index" ON "room_type_medias" ("name")');
        await queryRunner.query('CREATE INDEX "room_type_medias_url_index" ON "room_type_medias" ("url")');
        await queryRunner.query('CREATE INDEX "room_type_medias_key_index" ON "room_type_medias" ("key")');
        await queryRunner.query('CREATE INDEX ON "room_type_medias" ("url", "key")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP TABLE IF EXISTS "room_type_medias" CASCADE');
    }
}
