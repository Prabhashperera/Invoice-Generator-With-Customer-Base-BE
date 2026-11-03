import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';
import { decimalTransformer } from '../../common/transformers/decimal.transformer.js';
import { Customer } from '../../customers/entities/customer.entity.js';
import { InvoiceItem } from './invoice-item.entity.js';

@Entity('invoices')
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 30, unique: true })
  invoiceNumber: string;

  @Column({ type: 'date', default: () => 'CURRENT_DATE' })
  issueDate: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({
    type: 'numeric',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: decimalTransformer,
  })
  totalAmount: number;

  @Index()
  @Column({ type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'customerId' })
  customer: Relation<Customer>;

  @OneToMany(() => InvoiceItem, (item) => item.invoice)
  items: InvoiceItem[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}