import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInvoiceNumberSequence1793691000000
  implements MigrationInterface
{
  name = 'CreateInvoiceNumberSequence1793691000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE "invoice_number_seq" START 1`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP SEQUENCE "invoice_number_seq"`);
  }
}