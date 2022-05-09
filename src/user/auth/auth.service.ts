import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UserType } from '@prisma/client';

interface RegisterParams {
  name: string;
  phone: string;
  email: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private readonly primaService: PrismaService) {}

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
    return user;
  }
}
