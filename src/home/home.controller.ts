import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { PropertyType } from '@prisma/client';
import { CreateHomeDto, HomeResponseDto } from './dtos/home.dto';
import { HomeService } from './home.service';

@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get()
  getHomes(
    @Query('city') city?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('propertyType') propertyType?: PropertyType,
  ): Promise<HomeResponseDto[]> {
    const price =
      minPrice || maxPrice
        ? {
            ...(minPrice && { gte: parseFloat(minPrice) }),
            ...(maxPrice && { lte: parseFloat(maxPrice) }),
          }
        : undefined;
    const filters = {
      ...(city && { city }),
      ...(price && { price }),
      ...(propertyType && { propertyType }),
    };
    return this.homeService.getHomes(filters);
  }

  @Get(':id')
  async getHome(@Param('id') id: number): Promise<HomeResponseDto> {
    const home = await this.homeService.getHome(id);
    return new HomeResponseDto(home);
  }

  @Post()
  async createHome(@Body() body: CreateHomeDto): Promise<HomeResponseDto> {
    console.log(body);
    // return await this.homeService.createHome(body);
return
  }

  @Put(':id')
  updateHome() {
    return {};
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  deleteHome() {}
}
