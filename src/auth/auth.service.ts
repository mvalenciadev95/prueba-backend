import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare } from 'bcrypt';
import { Usuario } from './usuario.entity';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private jwtService: JwtService,
  ) {}

  async onModuleInit() {
    const adminExists = await this.usuariosRepository.findOne({
      where: { email: 'admin@homepower.com' },
    });

    if (!adminExists) {
      const admin = this.usuariosRepository.create({
        email: 'admin@homepower.com',
        password: 'admin123',
      });
      await this.usuariosRepository.save(admin);
    }
  }

  async login(loginDto: LoginDto) {
    const usuario = await this.usuariosRepository.findOne({
      where: { email: loginDto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await compare(loginDto.password, usuario.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { email: loginDto.email, sub: usuario.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}

