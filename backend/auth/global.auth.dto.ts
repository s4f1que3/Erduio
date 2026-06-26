import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class authDTO {

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(25)
  @Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : value)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  password!: string;

  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/<\/?[^>]+(>|$)/g, "") : value) 
  name!: string

  @IsString()
  @MaxLength(12)
  phone!: string

  @IsString()
  @MaxLength(6)
  token!: string
}