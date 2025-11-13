import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Usuario } from './usuario.entity';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const mockRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('debe retornar un access_token cuando las credenciales son válidas', async () => {
      const loginDto: LoginDto = {
        email: 'admin@homepower.com',
        password: 'admin123',
      };

      const usuarioMock = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@homepower.com',
        password: 'hashed-password',
      } as unknown as Usuario;

      const tokenMock = 'jwt-token-mock';

      mockRepository.findOne.mockResolvedValue(
        usuarioMock as unknown as Usuario,
      );
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue(tokenMock);

      const result = await service.login(loginDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        usuarioMock.password,
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: usuarioMock.email,
        sub: usuarioMock.id,
      });
      expect(result).toEqual({ access_token: tokenMock });
    });

    it('debe lanzar UnauthorizedException cuando el usuario no existe', async () => {
      const loginDto: LoginDto = {
        email: 'nonexistent',
        password: 'password',
      };

      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException cuando la contraseña es incorrecta', async () => {
      const loginDto: LoginDto = {
        email: 'admin@homepower.com',
        password: 'wrong-password',
      };

      const usuarioMock: Usuario = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@homepower.com',
        password: 'hashed-password',
        hashPassword: jest.fn(),
      } as unknown as Usuario;

      mockRepository.findOne.mockResolvedValue(usuarioMock);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.login(loginDto)).rejects.toThrow(
        'Credenciales inválidas',
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        usuarioMock.password,
      );
      expect(mockJwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('onModuleInit', () => {
    it('debe crear el usuario admin si no existe', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      const adminMock: Usuario = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@homepower.com',
        password: 'hashed-password',
        hashPassword: jest.fn(),
      } as unknown as Usuario;
      mockRepository.create.mockReturnValue(adminMock as unknown as Usuario);
      mockRepository.save.mockResolvedValue(adminMock as unknown as Usuario);

      await service.onModuleInit();

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@homepower.com' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith({
        email: 'admin@homepower.com',
        password: 'admin123',
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('no debe crear el usuario admin si ya existe', async () => {
      const adminMock: Usuario = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'admin@homepower.com',
        password: 'hashed-password',
        hashPassword: jest.fn(),
      };
      mockRepository.findOne.mockResolvedValue(adminMock as unknown as Usuario);

      await service.onModuleInit();

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@homepower.com' },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });
});
