import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const emailEmUso = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (emailEmUso) {
      throw new ConflictException('Email ja cadastrado.');
    }

    const senhaHash = await bcrypt.hash(dto.senha, 10);
    const usuario = await this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        email: dto.email,
        senhaHash,
      },
      select: { id: true, nome: true, email: true, createdAt: true, updatedAt: true },
    });

    return {
      usuario,
      accessToken: this.assinarToken(usuario.id, usuario.email),
    };
  }

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais invalidas.');
    }

    return {
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        createdAt: usuario.createdAt,
        updatedAt: usuario.updatedAt,
      },
      accessToken: this.assinarToken(usuario.id, usuario.email),
    };
  }

  private assinarToken(usuarioId: string, email: string) {
    return this.jwtService.sign(
      { sub: usuarioId, email },
      {
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1d',
      },
    );
  }
}
