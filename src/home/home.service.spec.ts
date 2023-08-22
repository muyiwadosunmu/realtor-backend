import { Test, TestingModule } from '@nestjs/testing';
import { HomeService, homeSelect } from './home.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyType } from '@prisma/client';
import { mock } from 'node:test';
import { NotFoundException } from '@nestjs/common';

const mockGetHomes = [
  {
    id: 2,
    address: '4 Offa- Garage',
    city: 'Ilorn',
    price: 1000000,
    propertyType: PropertyType.RESIDENTIAL,
    image: 'img1',
    images: [
      {
        url: 'src1',
      },
    ],
    numberOfBedrooms: 2,
    numberOfBathrooms: 2,
  },
];

describe('HomeService', () => {
  let service: HomeService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HomeService,
        {
          provide: PrismaService,
          useValue: {
            home: {
              findMany: jest.fn().mockReturnValue(mockGetHomes),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HomeService>(HomeService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  describe('getHomes', () => {
    const filters = {
      city: 'Ilorin',
      price: {
        gte: 100000,
        lte: 200000,
      },
    };
    it('Should call prisma home.findMany with many parameters', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);

      await service.getHomes(filters);

      expect(mockPrismaFindManyHomes).toBeCalledWith({
        select: {
          ...homeSelect,
          images: {
            select: {
              url: true,
            },
            take: 1,
          },
        },
        where: filters,
      });
    });

    it('should throw Not Found exception if no homes are foumd', async () => {
      const mockPrismaFindManyHomes = jest.fn().mockReturnValue(mockGetHomes);

      jest
        .spyOn(prismaService.home, 'findMany')
        .mockImplementation(mockPrismaFindManyHomes);
      expect(service.getHomes(filters)).rejects.toThrowError(NotFoundException);
    });
  });
});
