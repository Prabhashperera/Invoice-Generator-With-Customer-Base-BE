import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Customer } from './entities/customer.entity.js';
import { CreateCustomerDto } from './dto/create-customer.dto.js';
import { UpdateCustomerDto } from './dto/update-customer.dto.js';
import { ILike } from 'typeorm';
import { likePattern, paginated, type Paginated } from '../common/pagination.js';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto.js';


const PG_FOREIGN_KEY_VIOLATION = '23503';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private readonly customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  // findAll(): Promise<Customer[]> {
  //   return this.customersRepository.find({ order: { createdAt: 'DESC' } });
  // }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOneBy({ id });
    if (!customer) {
      throw new NotFoundException(`Customer with id ${id} was not found`);
    }
    return customer;
  }

  async update(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    const customer = await this.findOne(id);
    this.customersRepository.merge(customer, updateCustomerDto);
    return this.customersRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    try {
      await this.customersRepository.remove(customer);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string }).code ===
          PG_FOREIGN_KEY_VIOLATION
      ) {
        throw new ConflictException(
          'This customer has invoices and cannot be deleted',
        );
      }
      throw error;
    }
  }

  async findAll(query: PaginationQueryDto): Promise<Paginated<Customer>> {
    const { page, limit, search } = query;
    const pattern = search ? likePattern(search) : null;
    const [data, total] = await this.customersRepository.findAndCount({
      where: pattern
        ? [{ name: ILike(pattern) }, { mobile: ILike(pattern) }]
        : undefined,
      order: { createdAt: 'DESC', id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return paginated(data, total, page, limit);
  }
}