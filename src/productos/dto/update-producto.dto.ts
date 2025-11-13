import { IsString, IsNumber, IsPositive, Min, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProductoDto {
  @ApiPropertyOptional({ description: 'Nombre del producto', example: 'Producto actualizado' })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Precio del producto', example: 149.99 })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  precio?: number;

  @ApiPropertyOptional({ description: 'Stock disponible', example: 20 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  stock?: number;
}

