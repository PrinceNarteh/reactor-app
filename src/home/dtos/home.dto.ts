import { PropertyType } from '@prisma/client';
import { Exclude, Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

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

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class HomeDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsPositive()
  @IsNotEmpty()
  numberOfBedrooms: number;

  @IsPositive()
  @IsNotEmpty()
  numberOfBathrooms: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsPositive()
  @IsNotEmpty()
  price: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ValidateNested({ each: true })
  @Type(() => Image)
  @IsArray()
  images: Image[];
}
