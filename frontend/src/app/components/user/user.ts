import { Component, OnInit } from '@angular/core';
import { CarService } from '../../services/car-service';
import { LocationService, Location } from '../../services/location-service';
import { BookingService } from '../../services/booking-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.html',
  styleUrl: './user.css',
  standalone: false
})
export class User implements OnInit {
  cars: any[] = [];
  allCars: any[] = []; // Store all cars for filtering
  locations: Location[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedBrand: string = '';
  
  // All categories from backend enum
  categories = [
    { value: 'ECONOMY', label: 'Economy' },
    { value: 'COMPACT', label: 'Compact' },
    { value: 'MID_SIZE', label: 'Mid-Size' },
    { value: 'FULL_SIZE', label: 'Full-Size' },
    { value: 'SUV', label: 'SUV' },
    { value: 'LUXURY', label: 'Luxury' },
    { value: 'VAN', label: 'Van' },
    { value: 'SPORTS', label: 'Sports' }
  ];

  // Get unique brands from cars
  get brands(): string[] {
    const uniqueBrands = [...new Set(this.allCars.map(car => car.make))];
    return uniqueBrands.sort();
  }

  // Modal state
  selectedCar: any = null;
  showModal: boolean = false;

  // Booking form state
  bookingStartDate: string = '';
  bookingEndDate: string = '';
  bookingLocationId: string = '';
  bookingSuccess: boolean = false;

  constructor(
    private carService: CarService,
    private locationService: LocationService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCars();
    this.locationService.getLocations().subscribe(locations => {
      this.locations = locations;
    });
  }

  loadCars() {
    this.carService.getCars().subscribe(cars => {
      this.allCars = cars;
      this.applyFilters();
    });
  }

  onSearch() {
    this.applyFilters();
  }

  filterByCategory(category: string) {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  filterByBrand(brand: string) {
    this.selectedBrand = this.selectedBrand === brand ? '' : brand;
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategory = '';
    this.selectedBrand = '';
    this.searchTerm = '';
    this.applyFilters();
  }

  private applyFilters() {
    let filteredCars = [...this.allCars];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filteredCars = filteredCars.filter(car => 
        car.make.toLowerCase().includes(term) ||
        car.model.toLowerCase().includes(term) ||
        car.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      filteredCars = filteredCars.filter(car => car.category === this.selectedCategory);
    }

    // Filter by brand
    if (this.selectedBrand) {
      filteredCars = filteredCars.filter(car => car.make === this.selectedBrand);
    }

    this.cars = filteredCars;
  }

  openModal(car: any) {
    this.selectedCar = car;
    this.showModal = true;
    this.bookingStartDate = '';
    this.bookingEndDate = '';
    this.bookingLocationId = '';
    this.bookingSuccess = false;
  }

  closeModal() {
    this.selectedCar = null;
    this.showModal = false;
    this.bookingStartDate = '';
    this.bookingEndDate = '';
    this.bookingLocationId = '';
    this.bookingSuccess = false;
  }

  bookCar() {
    if (!this.bookingStartDate || !this.bookingEndDate || !this.bookingLocationId) {
      this.bookingSuccess = false;
      return;
    }
    this.bookingService.createBooking({
      carId: this.selectedCar.id,
      startDate: this.bookingStartDate,
      endDate: this.bookingEndDate,
      locationId: this.bookingLocationId
    }).subscribe({
      next: () => {
        this.bookingSuccess = true;
        setTimeout(() => {
          this.closeModal();
          this.router.navigate(['/user-bookings']);
        }, 3000);
      },
      error: () => {
        this.bookingSuccess = false;
        // Optionally show an error message
      }
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}
