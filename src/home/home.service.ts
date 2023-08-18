import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';

interface GetHomesParam {
  city?: string;
  price?: {
    gte?: number;
    lte?: number;
  };
  propertyType?: PropertyType;
}

const homeSelect = {
  id: true,
  address: true,
  city: true,
  price: true,
  propertyType: true,
  number_of_bathrooms: true,
  number_of_bedrooms: true,
};

interface Image {
  // home_id: number;
  url: string;
}

interface CreateHomeParams {
  address: string;

  numberofBedrooms: number;

  numberofBathrooms: number;

  city: string;

  price: number;
  landSize: number;

  propertyType: PropertyType;

  images: { url: string }[];
}

interface UpdateHomeParams {
  address?: string;

  numberofBedrooms?: number;

  numberofBathrooms?: number;

  city?: string;

  price?: number;
  landSize?: number;

  propertyType?: PropertyType;

  // images: { url: string }[]; was removed
}

@Injectable()
export class HomeService {
  constructor(private readonly prismaService: PrismaService) {}
  /////////////
  async getHomes(filter: GetHomesParam): Promise<HomeResponseDto[]> {
    const homes = await this.prismaService.home.findMany({
      select: {
        id: true,
        address: true,
        city: true,
        price: true,
        propertyType: true,
        number_of_bathrooms: true,
        number_of_bedrooms: true,
        images: {
          select: {
            url: true,
          },
          take: 1,
        },
      },
      where: filter, // injected our query parameter into the where
    });
    if (!homes.length) {
      throw new NotFoundException();
    }
    return homes.map((home) => {
      const fetchHome = { ...home, image: home.images[0].url };
      delete fetchHome.images;
      return new HomeResponseDto(fetchHome);
    });
    // return homes.map(
    //   (home) => new HomeResponseDto({ ...home, image: home.images[0].url }),
    // );
  }

  async getHome(id: number) {
    const home = await this.prismaService.home.findUnique({
      where: {
        id,
      },
      select: {
        ...homeSelect,
        images: {
          select: {
            url: true,
          },
        },
        realtor: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return new HomeResponseDto(home);
  }

  async createHome({
    address,
    numberofBathrooms,
    numberofBedrooms,
    city,
    landSize,
    price,
    propertyType,
    images,
  }: CreateHomeParams) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberofBathrooms,
        number_of_bedrooms: numberofBedrooms,
        city,
        land_size: landSize,
        propertyType,
        price,
        realtor_id: 3, // Hardcoded
      },
    });
    const homeImages = images.map((image) => {
      return { ...image, home_id: home.id };
    });
    await this.prismaService.image.createMany({ data: homeImages });

    const newHome = new HomeResponseDto(home);
    return newHome;
  }

  async updateHomeById(homeid: number, data: UpdateHomeParams) {
    // Find Home
    const home = await this.prismaService.home.findUnique({
      where: {
        id: homeid,
      },
    });
    // Check
    if (!home) {
      throw new NotFoundException('Not Found');
    }

    const updatedHome = await this.prismaService.home.update({
      where: {
        id: homeid,
      },
      data,
    });

    return new HomeResponseDto(updatedHome);
  }

  async deleteHomeById(homeId: number) {
    //If using sequel we could just use a cascade function
    await this.prismaService.image.deleteMany({
      where: {
        home_id: homeId,
      },
    });
    await this.prismaService.home.delete({
      where: {
        id: homeId,
      },
    });
  }
}
