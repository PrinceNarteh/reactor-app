import { PropertyType } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class HomeResponseDto {
  id: number;
  address: string;
  numberOfBedrooms: number;
  numberOfBathrooms: number;
  city: string;
  listedDate: Date;
  price: number;
  propertyType: PropertyType;

  @Exclude()
  realtorId: number;

  @Exclude()
  createdAt: Date;

  @Exclude()
  updatedAt: Date;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}
