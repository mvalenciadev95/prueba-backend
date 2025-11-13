import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductoDto } from './dto/query-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const producto = this.productosRepository.create(createProductoDto);
    return await this.productosRepository.save(producto);
  }

  async findAll(queryDto?: QueryProductoDto): Promise<Producto[]> {
    const { nombre, precioMin, precioMax, stockMin } = queryDto || {};

    const queryBuilder =
      this.productosRepository.createQueryBuilder('producto');

    if (nombre) {
      queryBuilder.where('producto.nombre LIKE :nombre', {
        nombre: `%${nombre}%`,
      });
    }

    if (precioMin !== undefined) {
      queryBuilder.andWhere('producto.precio >= :precioMin', { precioMin });
    }

    if (precioMax !== undefined) {
      queryBuilder.andWhere('producto.precio <= :precioMax', { precioMax });
    }

    if (stockMin !== undefined) {
      queryBuilder.andWhere('producto.stock >= :stockMin', { stockMin });
    }

    return await queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Producto> {
    const producto = await this.productosRepository.findOne({ where: { id } });
    if (!producto) {
      throw new NotFoundException(`Producto con ID ${id} no encontrado`);
    }
    return producto;
  }

  async update(
    id: string,
    updateProductoDto: UpdateProductoDto,
  ): Promise<Producto> {
    const producto = await this.findOne(id);
    Object.assign(producto, updateProductoDto);
    return await this.productosRepository.save(producto);
  }

  async remove(id: string): Promise<void> {
    const producto = await this.findOne(id);
    await this.productosRepository.remove(producto);
  }
}
