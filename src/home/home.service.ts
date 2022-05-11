import { Injectable } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dtos/home.dto';

interface GetHomeParams {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}

  async getHomes(filters: GetHomeParams): Promise<HomeResponseDto[]> {
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
      where: filters,
    });
    return homes.map((home) => new HomeResponseDto(home));
  }
}
