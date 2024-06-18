import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeatureSeeder1702795335133 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO features ("name", icon) VALUES('Free Wi-Fi', 'wifi')`);
        await queryRunner.query(`INSERT INTO features ("name", icon) VALUES('Air conditioner', 'fan')`);
        await queryRunner.query(`INSERT INTO features ("name", icon) VALUES('Chair', 'chair')`);
        await queryRunner.query(`INSERT INTO features ("name", icon) VALUES('Electric kettle', 'mug-hot')`);
        await queryRunner.query(`INSERT INTO features ("name", icon) VALUES('Soap & Shampoo', 'pump-soap')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM features`);
    }
}
