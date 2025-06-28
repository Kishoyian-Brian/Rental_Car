import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { ApiResponseService } from '../shared/api-response.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';

@Injectable()
export class LocationService {
  constructor(
    private prisma: PrismaService,
    private apiResponse: ApiResponseService,
  ) {}

  async create(createLocationDto: CreateLocationDto) {
    try {
      const location = await this.prisma.location.create({
        data: createLocationDto,
        include: {
          cars: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              available: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        location,
        'Location created successfully',
        '',
        location,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to create location',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findAll() {
    try {
      const locations = await this.prisma.location.findMany({
        include: {
          cars: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              available: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        locations,
        'Locations retrieved successfully',
        '',
        locations,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve locations',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOne(id: string) {
    try {
      const location = await this.prisma.location.findUnique({
        where: { id },
        include: {
          cars: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              available: true,
            },
          },
        },
      });

      if (!location) {
        return this.apiResponse.notFound('Location not found');
      }

      return this.apiResponse.ok(
        location,
        'Location retrieved successfully',
        '',
        location,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve location',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    try {
      const location = await this.prisma.location.update({
        where: { id },
        data: updateLocationDto,
        include: {
          cars: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              available: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        location,
        'Location updated successfully',
        '',
        location,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to update location',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.location.delete({
        where: { id },
      });

      return this.apiResponse.ok(
        null,
        'Location deleted successfully',
        '',
        null,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to delete location',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
} 