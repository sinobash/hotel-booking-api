import { MigrationInterface, QueryRunner } from 'typeorm';

export class CurrencySeeder1702717748878 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO currencies (code, symbol, description, decimal_place, is_default) VALUES('USD', '$', 'US Dollar', 2, 1)`,
        );
        await queryRunner.query(
            `INSERT INTO currencies (code, symbol, description, decimal_place, is_default) VALUES('MYR', 'RM', 'Malaysian Ringgit', 2, 0)`,
        );
        await queryRunner.query(
            `INSERT INTO currencies (code, symbol, description, decimal_place, is_default) VALUES('SGD', '$', 'Singapore Dollar', 2, 0)`,
        );
        await queryRunner.query(
            `INSERT INTO currencies (code, symbol, description, decimal_place, is_default) VALUES('IDR', 'Rp', 'Indonesian Rupiah', 2, 0)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM currencies WHERE code = 'USD'`);
        await queryRunner.query(`DELETE FROM currencies WHERE code = 'MYR'`);
        await queryRunner.query(`DELETE FROM currencies WHERE code = 'SGD'`);
        await queryRunner.query(`DELETE FROM currencies WHERE code = 'IDR'`);
    }
}
