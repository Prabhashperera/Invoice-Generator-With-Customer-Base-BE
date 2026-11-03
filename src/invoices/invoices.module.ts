import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../customers/customers.module.js';
import { ProductsModule } from '../products/products.module.js';
import { InvoicesService } from './invoices.service.js';
import { InvoicesController } from './invoices.controller.js';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceItem } from './entities/invoice-item.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    CustomersModule,
    ProductsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
})
export class InvoicesModule {}