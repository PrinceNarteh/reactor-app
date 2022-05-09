import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { User, UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from 'src/prisma/prisma.service';

interface RegisterParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface GenerateProductKeyParams {
  email: string;
  userType: UserType;
}

@Injectable()
export class AuthService {
  constructor(private readonly primaService: PrismaService) {}

  generateToken(user: User) {
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15min',
      },
    );
  }

  async register({ email, password, name, phone }: RegisterParams) {
    const userExists = await this.primaService.user.findUnique({
      where: { email },
    });
    if (userExists) {
      throw new ConflictException('Email already in use.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.primaService.user.create({
      data: {
        email,
        password: hashedPassword,
        phone,
        name,
        user_type: UserType.BUYER,
      },
    });
    const token = this.generateToken(user);
    return { token };
  }

  async login({ email, password }: LoginParams) {
    const user = await this.primaService.user.findUnique({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestException('Invalid Credential');
    }
    const token = this.generateToken(user);
    return { token };
  }

  async generateProductKey({ email, userType }: GenerateProductKeyParams) {
    const string = `${email}-${userType}-${process.env.PRODUCT_KEY_SECRET}`;
    return bcrypt.hash(string, 10);
  }
}
