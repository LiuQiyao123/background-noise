import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @Matches(/^1\d{10}$/, { message: '手机号格式无效' })
  phone!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(64)
  password!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(32)
  nickname!: string;
}
