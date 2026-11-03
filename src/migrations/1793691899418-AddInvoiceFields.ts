import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInvoiceFields1793691899418 implements MigrationInterface {
    name = 'AddInvoiceFields1793691899418'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ADD "issueDate" date NOT NULL DEFAULT ('now'::text)::date`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "notes" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "notes"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "issueDate"`);
    }

}
