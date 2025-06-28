import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from '../dto/create-location.dto';
import { UpdateLocationDto } from '../dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  async findAll() {
    return this.locationService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.locationService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() updateLocationDto: UpdateLocationDto) {
    return this.locationService.update(id, updateLocationDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.locationService.remove(id);
  }
} 