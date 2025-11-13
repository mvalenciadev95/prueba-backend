import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryProductoDto {
  @ApiPropertyOptional({
    description: 'Filtrar por nombre',
    example: 'producto',
  })
  @IsOptional()
  @IsString()
  nombre?: string;

  @ApiPropertyOptional({ description: 'Precio mínimo', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMin?: number;

  @ApiPropertyOptional({ description: 'Precio máximo', example: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  precioMax?: number;

  @ApiPropertyOptional({ description: 'Stock mínimo', example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  stockMin?: number;
}
