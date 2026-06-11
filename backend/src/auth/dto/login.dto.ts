import { IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/^1\d{10}$/, { message: '手机号格式无效' })
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
