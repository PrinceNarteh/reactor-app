import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        numberOfBathrooms: true,
        numberOfBedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
    });
    return homes.map((home) => new HomeResponseDto(home));
  }
}
