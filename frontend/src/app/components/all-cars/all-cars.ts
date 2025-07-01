import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CarService, Car } from '../../services/car-service';
import { LocationService, Location } from '../../services/location-service';

@Component({
  selector: 'app-all-cars',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './all-cars.html',
  styleUrls: ['./all-cars.css']
})
export class AllCars implements OnInit {
  cars: Car[] = [];
  filteredCars: Car[] = [];
  
  // Search and filters
  searchTerm: string = '';
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedTransmissions: string[] = [];
  selectedFuelTypes: string[] = [];
  priceRange: string = '';
  
  // Available options
  categories: string[] = [
    'ECONOMY', 'COMPACT', 'MID_SIZE', 'FULL_SIZE', 'SUV', 'LUXURY', 'VAN', 'SPORTS'
  ];
  brands: string[] = [];
  transmissions: string[] = ['AUTOMATIC', 'MANUAL'];
  fuelTypes: string[] = ['GASOLINE', 'DIESEL', 'ELECTRIC', 'HYBRID'];

  // Modal state
  selectedCar: Car | null = null;
  showDetailsModal: boolean = false;
  locations: Location[] = [];

  constructor(
    private carService: CarService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    this.loadCars();
    this.loadLocations();
  }

  loadCars() {
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.cars = cars;
        this.filteredCars = cars;
        this.extractBrands();
        this.applyFilters();
      },
      error: (err) => console.error('Failed to load cars', err)
    });
  }

  loadLocations() {
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => console.error('Failed to load locations', err)
    });
  }

  extractBrands() {
    const uniqueBrands = new Set(this.cars.map(car => car.make));
    this.brands = Array.from(uniqueBrands).sort();
  }

  applyFilters() {
    this.filteredCars = this.cars.filter(car => {
      // Search term filter
      if (this.searchTerm) {
        const searchLower = this.searchTerm.toLowerCase();
        const carText = `${car.make} ${car.model} ${car.category} ${car.transmission}`.toLowerCase();
        if (!carText.includes(searchLower)) {
          return false;
        }
      }

      // Category filter
      if (this.selectedCategories.length > 0 && !this.selectedCategories.includes(car.category)) {
        return false;
      }

      // Brand filter
      if (this.selectedBrands.length > 0 && !this.selectedBrands.includes(car.make)) {
        return false;
      }

      // Transmission filter
      if (this.selectedTransmissions.length > 0 && !this.selectedTransmissions.includes(car.transmission)) {
        return false;
      }

      // Fuel type filter
      if (this.selectedFuelTypes.length > 0 && !this.selectedFuelTypes.includes(car.fuelType)) {
        return false;
      }

      // Price range filter
      if (this.priceRange) {
        const dailyRate = car.dailyRate;
        switch (this.priceRange) {
          case '0-50':
            if (dailyRate > 50) return false;
            break;
          case '51-100':
            if (dailyRate < 51 || dailyRate > 100) return false;
            break;
          case '101-150':
            if (dailyRate < 101 || dailyRate > 150) return false;
            break;
          case '151+':
            if (dailyRate < 151) return false;
            break;
        }
      }

      return true;
    });
  }

  toggleCategory(category: string) {
    const index = this.selectedCategories.indexOf(category);
    if (index > -1) {
      this.selectedCategories.splice(index, 1);
    } else {
      this.selectedCategories.push(category);
    }
    this.applyFilters();
  }

  toggleBrand(brand: string) {
    const index = this.selectedBrands.indexOf(brand);
    if (index > -1) {
      this.selectedBrands.splice(index, 1);
    } else {
      this.selectedBrands.push(brand);
    }
    this.applyFilters();
  }

  toggleTransmission(transmission: string) {
    const index = this.selectedTransmissions.indexOf(transmission);
    if (index > -1) {
      this.selectedTransmissions.splice(index, 1);
    } else {
      this.selectedTransmissions.push(transmission);
    }
    this.applyFilters();
  }

  toggleFuelType(fuelType: string) {
    const index = this.selectedFuelTypes.indexOf(fuelType);
    if (index > -1) {
      this.selectedFuelTypes.splice(index, 1);
    } else {
      this.selectedFuelTypes.push(fuelType);
    }
    this.applyFilters();
  }

  setPriceRange(range: string) {
    this.priceRange = this.priceRange === range ? '' : range;
    this.applyFilters();
  }

  clearAllFilters() {
    this.searchTerm = '';
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.selectedTransmissions = [];
    this.selectedFuelTypes = [];
    this.priceRange = '';
    this.applyFilters();
  }

  getCarImageUrl(car: Car): string {
    if (car.imageUrls && car.imageUrls.length > 0) {
      return car.imageUrls[0];
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  onImageError(event: any) {
    event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
  }

  bookCar(car: Car) {
    // Navigate to booking page with car details
    console.log('Booking car:', car);
    // You can implement navigation to booking page here
  }

  viewDetails(car: Car) {
    this.selectedCar = car;
    this.showDetailsModal = true;
  }

  closeDetailsModal() {
    this.selectedCar = null;
    this.showDetailsModal = false;
  }

  getLocationName(locationId: string): string {
    const location = this.locations.find(loc => loc.id === locationId);
    return location ? `${location.name} (${location.city})` : 'Location not specified';
  }

  getCategoryLabel(category: string): string {
    const categoryMap: { [key: string]: string } = {
      'ECONOMY': 'Economy',
      'COMPACT': 'Compact',
      'MID_SIZE': 'Mid-Size',
      'FULL_SIZE': 'Full-Size',
      'SUV': 'SUV',
      'LUXURY': 'Luxury',
      'VAN': 'Van',
      'SPORTS': 'Sports'
    };
    return categoryMap[category] || category;
  }

  getTransmissionLabel(transmission: string): string {
    return transmission === 'AUTOMATIC' ? 'Automatic' : 'Manual';
  }

  getFuelTypeLabel(fuelType: string): string {
    const fuelMap: { [key: string]: string } = {
      'GASOLINE': 'Gasoline',
      'DIESEL': 'Diesel',
      'ELECTRIC': 'Electric',
      'HYBRID': 'Hybrid'
    };
    return fuelMap[fuelType] || fuelType;
  }
}
