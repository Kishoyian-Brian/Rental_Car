import { Injectable } from '@nestjs/common';
import { PrismaService } from '../shared/prisma.service';
import { ApiResponseService } from '../shared/api-response.service';
import { CloudinaryService } from '../shared/cloudinary/cloudinary.service';
import { CreateCarDto } from '../dto/create-car.dto';
import { UpdateCarDto } from '../dto/update-car.dto';
import { CarSearchFilters } from '../interfaces/car.interface';

@Injectable()
export class CarService {
  constructor(
    private prisma: PrismaService,
    private apiResponse: ApiResponseService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createCarDto: CreateCarDto) {
    try {
      const existingCar = await this.prisma.car.findUnique({
        where: { licensePlate: createCarDto.licensePlate },
      });

      if (existingCar) {
        return this.apiResponse.badRequest('Car with this license plate already exists');
      }

      const car = await this.prisma.car.create({
        data: createCarDto,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },
      });

      return this.apiResponse.ok(car, 'Car created successfully', '', car);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to create car',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async createWithImages(createCarDto: CreateCarDto, files?: Express.Multer.File[]) {
    try {
      const existingCar = await this.prisma.car.findUnique({
        where: { licensePlate: createCarDto.licensePlate },
      });

      if (existingCar) {
        return this.apiResponse.badRequest('Car with this license plate already exists');
      }

      // Upload images to Cloudinary if provided
      let imageUrls: string[] = [];
      if (files && files.length > 0) {
        const uploadPromises = files.map(file => 
          this.cloudinaryService.uploadImageBuffer(file.buffer, file.originalname)
        );
        const uploadResults = await Promise.all(uploadPromises);
        imageUrls = uploadResults;
      }

      // Combine existing imageUrls with uploaded ones
      const allImageUrls = [...(createCarDto.imageUrls || []), ...imageUrls];

      const car = await this.prisma.car.create({
        data: {
          ...createCarDto,
          imageUrls: allImageUrls,
        },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },
      });

      return this.apiResponse.ok(car, 'Car created successfully with images', '', car);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to create car with images',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findAll(filters?: CarSearchFilters) {
    try {
      const where: any = {};

      if (filters?.category) where.category = filters.category;
      if (filters?.transmission) where.transmission = filters.transmission;
      if (filters?.fuelType) where.fuelType = filters.fuelType;
      if (filters?.available !== undefined) where.available = filters.available;
      if (filters?.locationId) where.locationId = filters.locationId;
      if (filters?.minSeats) where.seats = { gte: filters.minSeats };
      if (filters?.maxSeats) where.seats = { ...where.seats, lte: filters.maxSeats };
      if (filters?.minDailyRate) where.dailyRate = { gte: filters.minDailyRate };
      if (filters?.maxDailyRate) where.dailyRate = { ...where.dailyRate, lte: filters.maxDailyRate };

      const cars = await this.prisma.car.findMany({
        where,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
      });

      const carsWithRating = cars.map(car => ({
        ...car,
        averageRating: car.reviews.length > 0 
          ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length 
          : 0,
        reviewCount: car.reviews.length,
      }));

      return this.apiResponse.ok(carsWithRating, 'Cars retrieved successfully', '', carsWithRating);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve cars',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async findOne(id: string) {
    try {
      const car = await this.prisma.car.findUnique({
        where: { id },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      if (!car) {
        return this.apiResponse.notFound('Car not found');
      }

      const averageRating = car.reviews.length > 0 
        ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length 
        : 0;

      const carWithRating = {
        ...car,
        averageRating,
        reviewCount: car.reviews.length,
      };

      return this.apiResponse.ok(carWithRating, 'Car retrieved successfully', '', carWithRating);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to retrieve car',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async update(id: string, updateCarDto: UpdateCarDto) {
    try {
      const car = await this.prisma.car.findUnique({
        where: { id },
      });

      if (!car) {
        return this.apiResponse.notFound('Car not found');
      }

      if (updateCarDto.licensePlate && updateCarDto.licensePlate !== car.licensePlate) {
        const existingCar = await this.prisma.car.findUnique({
          where: { licensePlate: updateCarDto.licensePlate },
        });

        if (existingCar) {
          return this.apiResponse.badRequest('Car with this license plate already exists');
        }
      }

      const updatedCar = await this.prisma.car.update({
        where: { id },
        data: updateCarDto,
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },
      });

      return this.apiResponse.ok(updatedCar, 'Car updated successfully', '', updatedCar);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to update car',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async remove(id: string) {
    try {
      const car = await this.prisma.car.findUnique({
        where: { id },
      });

      if (!car) {
        return this.apiResponse.notFound('Car not found');
      }

      const activeBookings = await this.prisma.booking.findMany({
        where: {
          carId: id,
          status: {
            in: ['PENDING', 'CONFIRMED', 'ACTIVE'],
          },
        },
      });

      if (activeBookings.length > 0) {
        return this.apiResponse.badRequest('Cannot delete car with active bookings');
      }

      await this.prisma.car.delete({
        where: { id },
      });

      return this.apiResponse.ok(null, 'Car deleted successfully', '', null);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to delete car',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async toggleAvailability(id: string) {
    try {
      const car = await this.prisma.car.findUnique({
        where: { id },
      });

      if (!car) {
        return this.apiResponse.notFound('Car not found');
      }

      const updatedCar = await this.prisma.car.update({
        where: { id },
        data: { available: !car.available },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },
      });

      return this.apiResponse.ok(
        updatedCar,
        `Car ${updatedCar.available ? 'made available' : 'made unavailable'} successfully`,
        '',
        updatedCar,
      );
    } catch (error) {
      return this.apiResponse.error(
        'Failed to toggle car availability',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async searchCars(searchTerm: string) {
    try {
      const cars = await this.prisma.car.findMany({
        where: {
          OR: [
            { make: { contains: searchTerm, mode: 'insensitive' } },
            { model: { contains: searchTerm, mode: 'insensitive' } },
            { licensePlate: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
          reviews: {
            select: { rating: true },
          },
        },
      });

      const carsWithRating = cars.map(car => ({
        ...car,
        averageRating: car.reviews.length > 0 
          ? car.reviews.reduce((sum, review) => sum + review.rating, 0) / car.reviews.length 
          : 0,
        reviewCount: car.reviews.length,
      }));

      return this.apiResponse.ok(carsWithRating, 'Car search completed successfully', '', carsWithRating);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to search cars',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  async uploadImages(id: string, files: Express.Multer.File[]) {
    try {
      const car = await this.prisma.car.findUnique({
        where: { id },
      });

      if (!car) {
        return this.apiResponse.notFound('Car not found');
      }

      const imageUrls: string[] = [];

      // Upload each image to Cloudinary
      for (const file of files) {
        const imageUrl = await this.cloudinaryService.uploadImageBuffer(
          file.buffer,
          file.originalname,
        );
        imageUrls.push(imageUrl);
      }

      // Update car with new image URLs
      const updatedCar = await this.prisma.car.update({
        where: { id },
        data: {
          imageUrls: [...car.imageUrls, ...imageUrls],
        },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true,
            },
          },
        },
      });

      return this.apiResponse.ok(updatedCar, 'Car images uploaded successfully', '', updatedCar);
    } catch (error) {
      return this.apiResponse.error(
        'Failed to upload car images',
        500,
        error instanceof Error ? error.message : String(error),
      );
    }
  }
}
