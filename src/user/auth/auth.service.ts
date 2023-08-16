import {
  Injectable,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Body } from '@nestjs/common/decorators';
import { SignUpDto } from '../dtos/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { UserType } from '@prisma/client';

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone: string;
}

interface SignInParams {
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}
  async signUp({ email, password, name, phone }: SignUpParams) {
    const userExists = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    //Check if user exists
    if (userExists) {
      throw new ConflictException();
    }

    // Hash password inputed
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.prismaService.user.create({
      data: {
        email,
        name,
        phone,
        password: hashedPassword,
        user_type: UserType.BUYER,
      },
    });

    // Generate token
    const token = await this.generateToken(name, user.id);
    return token;
  }

  async signIn({ email, password }: SignInParams) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }

    const hashedPassword = user.password;
    const isValidPassword = await bcrypt.compare(password, hashedPassword);

    if (!isValidPassword) {
      throw new HttpException('Invalid Credentials', HttpStatus.BAD_REQUEST);
    }

    const token = await this.generateToken(user.name, user.id);
    return token;
  }
  private generateToken(name: string, id: number) {
    return jwt.sign({ name, id }, process.env.JWT_SECRET_KEY, {
      expiresIn: 360000,
    });
  }
}
