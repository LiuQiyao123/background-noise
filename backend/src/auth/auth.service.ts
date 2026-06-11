import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (exists) {
      throw new ConflictException('该手机号已注册');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        nickname: dto.nickname,
      },
      select: {
        id: true,
        phone: true,
        nickname: true,
        avatarUrl: true,
        defaultVisibility: true,
        createdAt: true,
      },
    });
    return {
      user,
      accessToken: this.signToken(user.id),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });
    if (!user) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('手机号或密码错误');
    }
    return {
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
        defaultVisibility: user.defaultVisibility,
        createdAt: user.createdAt,
      },
      accessToken: this.signToken(user.id),
    };
  }

  signToken(userId: string) {
    return this.jwt.sign({ sub: userId });
  }
}
