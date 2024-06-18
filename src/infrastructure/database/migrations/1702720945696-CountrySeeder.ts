import { MigrationInterface, QueryRunner } from 'typeorm';

export class CountrySeeder1702720945696 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO countries (code, "name", phone_code, latitude, longitude, currency_id) VALUES('MY', 'Malaysia', '60', 2.50000000, 112.50000000, 2)`,
        );
        await queryRunner.query(
            `INSERT INTO countries (code, "name", phone_code, latitude, longitude, currency_id) VALUES('SG', 'Singapore', '65', 1.36666666, 103.80000000, 3)`,
        );
        await queryRunner.query(
            `INSERT INTO countries (code, "name", phone_code, latitude, longitude, currency_id) VALUES('ID', 'Indonesia', '62', -5.00000000, 120.00000000, 4)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM countries WHERE code = 'MY'`);
        await queryRunner.query(`DELETE FROM countries WHERE code = 'SG'`);
        await queryRunner.query(`DELETE FROM countries WHERE code = 'ID'`);
    }
}
