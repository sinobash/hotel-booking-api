import { MigrationInterface, QueryRunner } from 'typeorm';

export class CitySeeder1702721577028 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Petaling Jaya', 3.10726000, 101.60671000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Kuala Selangor', 3.35000000, 101.25000000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Shah Alam', 3.08507000, 101.53281000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Subang Jaya', 3.04384000, 101.58062000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Kuala Lumpur', 3.14120000, 101.68653000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Kuching', 1.55000000, 110.33333000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Miri', 4.39928000, 113.99163000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Johor Bahru', 1.46550000, 103.75780000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Muar', 2.04420000, 102.56890000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Bukit Timah', 1.32940000, 103.80210000, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Singapore', 1.28967000, 103.85007000, 2)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Marine Parade', 1.30300000, 103.90720000, 2)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Jakarta Pusat', -6.17770000, 106.84030000, 3)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Jakarta Utara', -6.13390000, 106.88230000, 3)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Jakarta Selatan', -6.26600000, 106.81350000, 3)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Jakarta Timur', -6.25210000, 106.88400000, 3)`,
        );
        await queryRunner.query(
            `INSERT INTO cities ("name", latitude, longitude, country_id) VALUES('Jakarta Barat', -6.16760000, 106.76730000, 3)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM cities`);
    }
}
