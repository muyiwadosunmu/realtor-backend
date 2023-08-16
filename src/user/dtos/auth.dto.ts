import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  Min,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @Matches(/^\+?\d{1,15}$/, {
    message: 'Phone must be a valid phone-number',
  })
  phone: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}

// /^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/
