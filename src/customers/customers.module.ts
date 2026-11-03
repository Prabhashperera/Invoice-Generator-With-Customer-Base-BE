import { Module } from '@nestjs/common';
import { CustomersService } from './customers.service.js';
import { CustomersController } from './customers.controller.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './entity/customer.entity.js';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer])
  ],
  controllers: [CustomersController],
  providers: [CustomersService],
})
export class CustomersModule {}
