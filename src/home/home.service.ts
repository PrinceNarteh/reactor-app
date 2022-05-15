import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { IUser } from 'src/user/decorators/user.decorator';
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

  async createHome(
    {
      address,
      city,
      images,
      numberOfBathrooms,
      numberOfBedrooms,
      price,
      propertyType,
    }: HomeParams,
    userId: number,
  ): Promise<HomeResponseDto> {
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
        realtorId: userId,
        images: {
          create: createImages,
        },
      },
    });

    return new HomeResponseDto(home);
  }

  async updateHome(
    id: number,
    data: Partial<Omit<HomeParams, 'images'>>,
  ): Promise<HomeResponseDto> {
    const home = await this.prismaService.home.findUnique({ where: { id } });
    if (!home) throw new NotFoundException();

    const updatedHome = await this.prismaService.home.update({
      where: { id },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHome(id: number) {
    return await this.prismaService.home.delete({ where: { id } });
  }

  async getRealtorByHomeId(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: { id },
      select: {
        realtor: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!home) throw new NotFoundException();
    return home.realtor;
  }

  async inquire(buyer: IUser, homeId: number, message: string) {
    const realtor = await this.getRealtorByHomeId(homeId);

    return await this.prismaService.message.create({
      data: {
        homeId,
        body: message,
        buyerId: buyer.id,
        realtorId: realtor.id,
      },
    });
  }
}
