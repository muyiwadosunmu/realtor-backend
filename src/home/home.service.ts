import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HomeResponseDto, InquireDto } from './dto/home.dto';
import { PropertyType } from '@prisma/client';
import { UserInfo } from 'src/decorators/user.decorator';

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

  async createHome(
    {
      address,
      numberofBathrooms,
      numberofBedrooms,
      city,
      landSize,
      price,
      propertyType,
      images,
    }: CreateHomeParams,
    userId: number,
  ) {
    const home = await this.prismaService.home.create({
      data: {
        address,
        number_of_bathrooms: numberofBathrooms,
        number_of_bedrooms: numberofBedrooms,
        city,
        land_size: landSize,
        propertyType,
        price,
        realtor_id: userId, // Hardcoded
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

  async getRealtorByHomeId(homeId: number) {
    const home = this.prismaService.home.findUnique({
      where: {
        id: homeId,
      },
      select: {
        realtor: {
          select: {
            email: true,
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    if (!home) {
      throw new NotFoundException();
    }

    return (await home).realtor;
  }

  async inquire(buyer: UserInfo, homeId: number, message) {
    const realtor = await this.getRealtorByHomeId(homeId);
    const newMessage = await this.prismaService.message.create({
      data: {
        realtor_id: realtor.id,
        buyer_id: buyer.id,
        home_id: homeId,
        message,
      },
    });
  }

  async getMessagesByHome(homeId: number) {
    return this.prismaService.message.findMany({
      where: {
        home_id: homeId,
      },
      select: {
        message: true,
        buyer: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });
  }
}
