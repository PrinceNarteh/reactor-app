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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { PropertyType, UserType } from '@prisma/client';
import { Roles } from 'src/decorators/roles.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { IUser, User } from 'src/user/decorators/user.decorator';
import { EnquireDto, HomeDto, HomeResponseDto } from './dtos/home.dto';
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
  async getHome(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<HomeResponseDto> {
    const home = await this.homeService.getHome(id);
    return new HomeResponseDto(home);
  }

  @Roles(UserType.REALTOR)
  @Post()
  async createHome(
    @Body() body: HomeDto,
    @User() user: IUser,
  ): Promise<HomeResponseDto> {
    return await this.homeService.createHome(body, user.id);
  }

  @Roles(UserType.REALTOR)
  @Put(':id')
  async updateHome(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: Partial<HomeDto>,
    @User() user: IUser,
  ): Promise<HomeResponseDto> {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();

    return await this.homeService.updateHome(id, body);
  }

  @Roles(UserType.REALTOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteHome(@Param('id', ParseIntPipe) id: number, @User() user: IUser) {
    const realtor = await this.homeService.getRealtorByHomeId(id);
    if (realtor.id !== user.id) throw new UnauthorizedException();

    return this.homeService.deleteHome(id);
  }

  @Roles(UserType.BUYER)
  @Post('/inquire/id')
  async inquire(
    @Param('id', ParseIntPipe) homeId: number,
    @User() user: IUser,
    @Body() { message }: EnquireDto,
  ) {
    return this.homeService.inquire(user, homeId, message);
  }
}
