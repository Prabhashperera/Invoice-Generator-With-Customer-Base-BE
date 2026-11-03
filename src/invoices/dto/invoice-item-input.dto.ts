import { IsInt, IsUUID, Max, Min } from 'class-validator';

export class InvoiceItemInputDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  @Max(100000)
  quantity: number;
}