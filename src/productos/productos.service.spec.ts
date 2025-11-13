import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { Producto } from './producto.entity';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';
import { QueryProductoDto } from './dto/query-producto.dto';

describe('ProductosService', () => {
  let service: ProductosService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductosService,
        {
          provide: getRepositoryToken(Producto),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProductosService>(ProductosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un producto', async () => {
      const createDto: CreateProductoDto = {
        nombre: 'Producto Test',
        precio: 100.5,
        stock: 10,
      };

      const productoMock: Producto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createDto,
      };

      mockRepository.create.mockReturnValue(productoMock);
      mockRepository.save.mockResolvedValue(productoMock);

      const result = await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.save).toHaveBeenCalledWith(productoMock);
      expect(result).toEqual(productoMock);
    });
  });

  describe('findAll', () => {
    it('debe retornar un array de productos sin filtros', async () => {
      const productosMock: Producto[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Producto 1',
          precio: 100.5,
          stock: 10,
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          nombre: 'Producto 2',
          precio: 200.75,
          stock: 20,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(productosMock),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll();

      expect(mockRepository.createQueryBuilder).toHaveBeenCalledWith(
        'producto',
      );
      expect(result).toEqual(productosMock);
    });

    it('debe aplicar filtros cuando se proporcionan', async () => {
      const queryDto: QueryProductoDto = {
        nombre: 'test',
        precioMin: 10,
        precioMax: 100,
        stockMin: 5,
      };

      const productosMock: Producto[] = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          nombre: 'Producto Test',
          precio: 50.0,
          stock: 10,
        },
      ];

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(productosMock),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.findAll(queryDto);

      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'producto.nombre LIKE :nombre',
        { nombre: '%test%' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledTimes(3);
      expect(result).toEqual(productosMock);
    });
  });

  describe('findOne', () => {
    it('debe retornar un producto por id', async () => {
      const productoMock: Producto = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        nombre: 'Producto Test',
        precio: 100.5,
        stock: 10,
      };

      mockRepository.findOne.mockResolvedValue(productoMock);

      const result = await service.findOne(productoMock.id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: productoMock.id },
      });
      expect(result).toEqual(productoMock);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `Producto con ID ${id} no encontrado`,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un producto', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateProductoDto = {
        nombre: 'Producto Actualizado',
        precio: 150.0,
      };

      const productoExistente: Producto = {
        id,
        nombre: 'Producto Original',
        precio: 100.5,
        stock: 10,
      };

      const productoActualizado: Producto = {
        ...productoExistente,
        ...updateDto,
      };

      mockRepository.findOne.mockResolvedValue(productoExistente);
      mockRepository.save.mockResolvedValue(productoActualizado);

      const result = await service.update(id, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(productoActualizado);
      expect(result).toEqual(productoActualizado);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const updateDto: UpdateProductoDto = {
        nombre: 'Producto Actualizado',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar un producto', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';
      const productoMock: Producto = {
        id,
        nombre: 'Producto Test',
        precio: 100.5,
        stock: 10,
      };

      mockRepository.findOne.mockResolvedValue(productoMock);
      mockRepository.remove.mockResolvedValue(productoMock);

      await service.remove(id);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(productoMock);
    });

    it('debe lanzar NotFoundException si el producto no existe', async () => {
      const id = '123e4567-e89b-12d3-a456-426614174000';

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
