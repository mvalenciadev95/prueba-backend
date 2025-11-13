import { IsString, IsNotEmpty, IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductoDto {
  @ApiProperty({ description: 'Nombre del producto', example: 'Producto ejemplo' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'Precio del producto', example: 99.99 })
  @IsNumber()
  @IsPositive()
  precio: number;

  @ApiProperty({ description: 'Stock disponible', example: 10 })
  @IsNumber()
  @Min(0)
  stock: number;
}

