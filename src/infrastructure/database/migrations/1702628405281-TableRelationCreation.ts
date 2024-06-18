import { MigrationInterface, QueryRunner } from 'typeorm';

export class TableRelationCreation1702628405281 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            'ALTER TABLE "users" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "users" ADD CONSTRAINT "FK_c28e52f758e7bbc53828il722194" FOREIGN KEY ("hotel_id") REFERENCES "hotels"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "users" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92048" FOREIGN KEY ("avatar_id") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "countries" ADD FOREIGN KEY ("currency_id") REFERENCES "currencies" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "cities" ADD FOREIGN KEY ("country_id") REFERENCES "countries" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "hotels" ADD FOREIGN KEY ("city_id") REFERENCES "cities" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "hotels" ADD FOREIGN KEY ("category_id") REFERENCES "categories" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "hotel_facilities" ADD FOREIGN KEY ("hotel_id") REFERENCES "hotels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "hotel_medias" ADD FOREIGN KEY ("hotel_id") REFERENCES "hotels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "room_types" ADD FOREIGN KEY ("hotel_id") REFERENCES "hotels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "room_type_features" ADD FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "room_type_medias" ADD FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "rooms" ADD FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "room_features" ADD FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "guests" ADD CONSTRAINT "FK_c28e52f758e7bbc14568db92048" FOREIGN KEY ("avatar_id") REFERENCES "media_files"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "guests" ADD CONSTRAINT "FK_c28e52f758e7bbc10967db92048" FOREIGN KEY ("document_id") REFERENCES "guest_document"("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "guest_document" ADD FOREIGN KEY ("verified_by") REFERENCES "users" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "bookings" ADD FOREIGN KEY ("hotel_id") REFERENCES "hotels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "bookings" ADD FOREIGN KEY ("guest_id") REFERENCES "guests" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "booked_room" ADD FOREIGN KEY ("booking_id") REFERENCES "bookings" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "booked_room" ADD FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "booked_room" ADD FOREIGN KEY ("room_id") REFERENCES "rooms" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "billings" ADD FOREIGN KEY ("hotel_id") REFERENCES "hotels" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "billings" ADD FOREIGN KEY ("room_type_id") REFERENCES "room_types" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
        await queryRunner.query(
            'ALTER TABLE "billings" ADD FOREIGN KEY ("guest_id") REFERENCES "guests" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION',
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // TODO document why this async method 'down' is empty
    }
}
