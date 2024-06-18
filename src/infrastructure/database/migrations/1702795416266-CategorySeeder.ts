import { MigrationInterface, QueryRunner } from 'typeorm';

export class CategorySeeder1702795416266 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO categories ("name", slug, description, url, "key", is_active, created_at, updated_at, deleted_at) VALUES('Hotel', 'hotel', 'Category Hotel', NULL, NULL, 1, NOW(), NULL, NULL)`,
        );
        await queryRunner.query(
            `INSERT INTO categories ("name", slug, description, url, "key", is_active, created_at, updated_at, deleted_at) VALUES('Co Living', 'co-living', 'Category Co Living', NULL, NULL, 1, NOW(), NULL, NULL)`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM categories WHERE slug='hotel'`);
        await queryRunner.query(`DELETE FROM categories WHERE slug='co-living'`);
    }
}
