import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginByCodeDto } from './dto/login-by-code.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SendCodeDto } from './dto/send-code.dto';

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

  /**
   * 发送验证码（暂不接短信服务，始终成功）
   */
  async sendCode(_dto: SendCodeDto) {
    // TODO: 接入真实短信服务后，在此调用 SMS API
    return { success: true };
  }

  /**
   * 验证码登录/注册
   * - 验证码固定为 1234（暂时）
   * - 新号码自动注册
   */
  async loginByCode(dto: LoginByCodeDto) {
    // 验证码校验
    if (dto.code !== '1234') {
      throw new UnauthorizedException('验证码错误');
    }

    // 查找已有用户
    const existing = await this.prisma.user.findUnique({
      where: { phone: dto.phone },
    });

    if (existing) {
      // 已有账号 → 登录
      return {
        user: {
          id: existing.id,
          phone: existing.phone,
          nickname: existing.nickname,
          avatarUrl: existing.avatarUrl,
          defaultVisibility: existing.defaultVisibility,
          createdAt: existing.createdAt,
        },
        accessToken: this.signToken(existing.id),
        isNewUser: false,
      };
    }

    // 新号码 → 自动注册
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    const nickname = `乐迷${randomSuffix}`;
    const passwordHash = await bcrypt.hash(dto.phone, 10); // phone as password fallback

    const user = await this.prisma.user.create({
      data: {
        phone: dto.phone,
        passwordHash,
        nickname,
        defaultVisibility: 'PUBLIC_TO_SHOW',
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
      isNewUser: true,
    };
  }

  signToken(userId: string) {
    return this.jwt.sign({ sub: userId });
  }
}
