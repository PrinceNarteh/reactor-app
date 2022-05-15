import { Injectable, NotFoundException } from '@nestjs/common';
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

interface HomeParams {
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  price: number;
  propertyType: PropertyType;
  images: { url: string }[];
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

    if (!homes.length) {
      throw new NotFoundException();
    }

    return homes.map((home) => new HomeResponseDto(home));
  }

  async getHome(id: number) {
    const home = await this.prismaService.home.findUnique({ where: { id } });

    if (!home) throw new NotFoundException();

    return new HomeResponseDto(home);
  }

  async createHome({
    address,
    city,
    images,
    numberOfBathrooms,
    numberOfBedrooms,
    price,
    propertyType,
  }: HomeParams): Promise<HomeResponseDto> {
    const createImages = images.map((image) => ({ url: image.url }));

    // console.log(images);

    const home = await this.prismaService.home.create({
      data: {
        address,
        city,
        numberOfBathrooms,
        numberOfBedrooms,
        price,
        propertyType,
        realtorId: 1,
        images: {
          create: createImages,
        },
      },
    });

    return new HomeResponseDto(home);
  }

  async updateHome(id: number, data: Partial<Omit<HomeParams, 'images'>>): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({ where: { id } });
    if (!home) throw new NotFoundException();

    const updatedHome = await this.prismaService.home.update({
      where: { id },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }
}
