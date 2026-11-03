import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, FindOptionsWhere, ILike, Repository } from 'typeorm';
import { fromCents, toCents } from '../common/money.js';
import { CustomersService } from '../customers/customers.service.js';
import { ProductsService } from '../products/products.service.js';
import { Invoice } from './entities/invoice.entity.js';
import { InvoiceItem } from './entities/invoice-item.entity.js';
import { CreateInvoiceDto } from './dto/create-invoice.dto.js';
import { UpdateInvoiceDto } from './dto/update-invoice.dto.js';
import { InvoiceItemInputDto } from './dto/invoice-item-input.dto.js';
import { Paginated, likePattern, paginated } from '../common/pagination.js';
import { InvoiceQueryDto } from './dto/invoice-query.dto.js';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoicesRepository: Repository<Invoice>,
    private readonly dataSource: DataSource,
    private readonly customersService: CustomersService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto): Promise<Invoice> {
    const { items: itemInputs, ...fields } = createInvoiceDto;

    // Both throw 404 if something does not exist.
    await this.customersService.findOne(fields.customerId);
    const built = await this.buildItems(itemInputs);

    const invoiceId = await this.dataSource.transaction(async (manager) => {
      const invoice = manager.create(Invoice, {
        ...fields,
        invoiceNumber: await this.generateInvoiceNumber(manager),
        totalAmount: built.total,
      });
      const saved = await manager.save(invoice);
      await manager.save(
        built.items.map((item) =>
          manager.create(InvoiceItem, { ...item, invoiceId: saved.id }),
        ),
      );
      return saved.id;
    });

    return this.findOne(invoiceId);
  }

  async findOne(id: string): Promise<Invoice> {
    const invoice = await this.invoicesRepository.findOne({
      where: { id },
      relations: { customer: true, items: true },
      order: { items: { position: 'ASC' } },
    });
    if (!invoice) {
      throw new NotFoundException(`Invoice with id ${id} was not found`);
    }
    return invoice;
  }

  async findAll(query: InvoiceQueryDto): Promise<Paginated<Invoice>> {
    const { page, limit, search, customerId } = query;
    const base: FindOptionsWhere<Invoice> = customerId ? { customerId } : {};
    const pattern = search ? likePattern(search) : null;
    const where: FindOptionsWhere<Invoice>[] = pattern
      ? [
          { ...base, invoiceNumber: ILike(pattern) },
          { ...base, customer: { name: ILike(pattern) } },
        ]
      : [base];

    const [data, total] = await this.invoicesRepository.findAndCount({
      where,
      relations: { customer: true, items: true },
      order: { createdAt: 'DESC', id: 'ASC', items: { position: 'ASC' } },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginated(data, total, page, limit);
  }

  async update(
    id: string,
    updateInvoiceDto: UpdateInvoiceDto,
  ): Promise<Invoice> {
    const { items: itemInputs, ...fields } = updateInvoiceDto;
    const built = itemInputs ? await this.buildItems(itemInputs) : null;

    await this.dataSource.transaction(async (manager) => {
      const invoice = await manager.findOneBy(Invoice, { id });
      if (!invoice) {
        throw new NotFoundException(`Invoice with id ${id} was not found`);
      }
      manager.merge(Invoice, invoice, fields);

      if (built) {
        // Replace all items and recalculate the total.
        await manager.delete(InvoiceItem, { invoiceId: id });
        await manager.save(
          built.items.map((item) =>
            manager.create(InvoiceItem, { ...item, invoiceId: id }),
          ),
        );
        invoice.totalAmount = built.total;
      }
      await manager.save(invoice);
    });

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const invoice = await this.findOne(id);
    // Items are removed by the database (ON DELETE CASCADE).
    await this.invoicesRepository.remove(invoice);
  }

  // Looks up each product and copies its name and price into the line
  // (a snapshot), then calculates line totals and the invoice total.
  private async buildItems(inputs: InvoiceItemInputDto[]) {
    const productIds = [...new Set(inputs.map((input) => input.productId))];
    const products = await this.productsService.findByIds(productIds);
    const productsById = new Map(products.map((p) => [p.id, p]));

    let totalCents = 0;
    const items = inputs.map((input, index) => {
      const product = productsById.get(input.productId);
      if (!product) {
        throw new NotFoundException(
          `Product with id ${input.productId} was not found`,
        );
      }
      const lineCents = input.quantity * toCents(product.unitPrice);
      totalCents += lineCents;
      return {
        productId: product.id,
        position: index + 1,
        description: product.name,
        quantity: input.quantity,
        unitPrice: product.unitPrice,
        lineTotal: fromCents(lineCents),
      };
    });

    return { items, total: fromCents(totalCents) };
  }

  private async generateInvoiceNumber(manager: EntityManager): Promise<string> {
    const rows: { nextval: string }[] = await manager.query(
      `SELECT nextval('invoice_number_seq') AS nextval`,
    );
    return `INV-${rows[0].nextval.padStart(6, '0')}`;
  }
}