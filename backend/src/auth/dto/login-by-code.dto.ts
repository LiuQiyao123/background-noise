import { IsString, Length, Matches } from 'class-validator';

export class LoginByCodeDto {
  @IsString()
  @Matches(/^1\d{10}$/, { message: '手机号格式无效' })
  phone!: string;

  @IsString()
  @Length(4, 4, { message: '验证码为4位数字' })
  code!: string;
}
