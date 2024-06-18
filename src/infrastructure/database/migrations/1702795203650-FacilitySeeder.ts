import { MigrationInterface, QueryRunner } from 'typeorm';

export class FacilitySeeder1702795203650 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Parking Space', 'square-parking')`);
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Communal Space', 'couch')`);
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Mushola', 'mosque')`);
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Water Refill', 'glass-water')`);
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Shared Bathroom', 'restroom')`);
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Shared Toilet', 'toilet')`);
        await queryRunner.query(`INSERT INTO facilities ("name", icon) VALUES('Hair Dryer', 'wind')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM facilities`);
    }
}
