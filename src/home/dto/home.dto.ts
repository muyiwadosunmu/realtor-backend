import { PropertyType, UserType } from '@prisma/client';
import {
  IsArray,
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  MinLength,
  ValidateNested,
  isPositive,
} from 'class-validator';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class HomeResponseDto {
  id: number;
  address: string;

  @Exclude()
  number_of_bedrooms: number;

  @Expose({ name: 'numberOfBedrooms' })
  numberOfBedrooms() {
    return this.number_of_bathrooms;
  }

  @Exclude()
  number_of_bathrooms: number;
  @Expose({ name: 'numberOfBathrooms' })
  numberOfBathrooms() {
    return this.number_of_bathrooms;
  }

  city: string;

  @Exclude()
  listed_date: Date;

  @Expose({ name: 'listedDate' })
  listedDate() {
    return this.listed_date;
  }
  price: number;

  image: string;

  @Exclude()
  land_size: number;

  @Expose({ name: 'landSize' })
  landSize() {
    return this.land_size;
  }
  propertyType: PropertyType;

  @Exclude()
  created_at: Date;
  @Exclude()
  updated_at: Date;
  @Exclude()
  realtor_id: number;

  constructor(partial: Partial<HomeResponseDto>) {
    Object.assign(this, partial);
  }
}

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDto {
  @ApiProperty({ description: 'Address of the property' })
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty({ description: 'Number of bedrooms the property has' })
  @IsNumber()
  @IsPositive()
  numberofBedrooms: number;

  @ApiProperty({ description: 'Number of bathrooms the property has' })
  @IsNumber()
  @IsPositive()
  numberofBathrooms: number;

  @ApiProperty({ description: 'Which city is the property located' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ description: 'Asking price of the property' })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({ description: 'The land size of the prperty in sq.metres' })
  @IsNumber()
  @IsPositive()
  landSize: number;

  @ApiProperty({
    description: 'Property type, for now we support a CONVO OR RESIDENTIAL',
  })
  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @ApiProperty({ description: 'Provide at least 3 images of the property' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}

export class UpdateHomeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberofBedrooms?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberofBathrooms?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize?: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType?: PropertyType;

  //   @IsOptional()
  //   @IsArray()
  //   @ValidateNested({ each: true })
  //   @Type(() => Image)
  //   images: Image[];
  // _______________THis was moved to another endpoint on purpose
}

export class InquireDto {
  @IsString()
  @IsNotEmpty()
  message: string;
}
