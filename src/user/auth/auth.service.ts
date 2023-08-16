import { Injectable, ConflictException } from '@nestjs/common';
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
    const token = await jwt.sign(
      { name, id: user.id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: 360000 },
    );
    return token;
  }
}
