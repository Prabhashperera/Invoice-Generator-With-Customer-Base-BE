import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProductsAndInvoiceItems1793692638575 implements MigrationInterface {
    name = 'AddProductsAndInvoiceItems1793692638575'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "description" text, "unitPrice" numeric(12,2) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invoice_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invoiceId" uuid NOT NULL, "productId" uuid, "position" integer NOT NULL, "description" character varying(255) NOT NULL, "quantity" integer NOT NULL, "unitPrice" numeric(12,2) NOT NULL, "lineTotal" numeric(12,2) NOT NULL, CONSTRAINT "PK_53b99f9e0e2945e69de1a12b75a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7fb6895fc8fad9f5200e91abb5" ON "invoice_items"  ("invoiceId") `);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "totalAmount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59" FOREIGN KEY ("invoiceId") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "invoice_items" ADD CONSTRAINT "FK_7bec360ed9928668b73dac2ec17" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_7bec360ed9928668b73dac2ec17"`);
        await queryRunner.query(`ALTER TABLE "invoice_items" DROP CONSTRAINT "FK_7fb6895fc8fad9f5200e91abb59"`);
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "totalAmount"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7fb6895fc8fad9f5200e91abb5"`);
        await queryRunner.query(`DROP TABLE "invoice_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
    }

}
