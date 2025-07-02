import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CarService, Car } from '../../services/car-service';
import { LocationService, Location } from '../../services/location-service';
import { ReviewService, Review } from '../../services/review-service';
import { BookingService, Booking } from '../../services/booking-service';
import { finalize } from 'rxjs/operators';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    DecimalPipe
  ]
})
export class AdminComponent implements OnInit {
  dashboardSection = '';
  cars: Car[] = [];
  filteredCars: Car[] = [];
  locations: Location[] = [];
  reviews: Review[] = [];
  bookings: Booking[] = [];
  selectedCar: Car | null = null;
  carForm: FormGroup;
  isEditMode = false;
  isLoading = false;
  filterForm: FormGroup;
  imageFiles: File[] = [];
  showDetails = false;
  carReviews: Review[] = [];
  carBookings: Booking[] = [];
  public totalRevenue = 0;
  showAddCarModal = false;
  toastMessage = '';
  showDeleteConfirm = false;
  carToDelete: Car | null = null;
  approvingAgentId: string | null = null;
  pendingAgentsError = '';
  pendingAgents: any[] = [];
  showCreateAgentModal = false;
  agentForm: FormGroup;
  creatingAgent = false;

  carCategories = [
    'ECONOMY', 'COMPACT', 'MID_SIZE', 'FULL_SIZE', 'SUV', 'LUXURY', 'VAN', 'SPORTS'
  ];
  transmissions = ['MANUAL', 'AUTOMATIC'];
  fuelTypes = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'];

  constructor(
    private carService: CarService,
    private locationService: LocationService,
    private reviewService: ReviewService,
    private bookingService: BookingService,
    private fb: FormBuilder,
    private adminService: AdminService,
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.carForm = this.fb.group({
      id: [''],
      make: ['', Validators.required],
      model: ['', Validators.required],
      year: ['', [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
      licensePlate: ['', Validators.required],
      category: ['', Validators.required],
      transmission: ['', Validators.required],
      fuelType: ['', Validators.required],
      seats: ['', [Validators.required, Validators.min(1), Validators.max(20)]],
      doors: ['', [Validators.required, Validators.min(2), Validators.max(6)]],
      dailyRate: ['', [Validators.required, Validators.min(0)]],
      hourlyRate: [''],
      available: [true],
      features: this.fb.array([]),
      locationId: [''],
      imageUrls: [[]],
      images: [null]
    });
    this.filterForm = this.fb.group({
      category: [''],
      transmission: [''],
      fuelType: [''],
      available: [''],
      locationId: [''],
      minSeats: [''],
      maxSeats: [''],
      minDailyRate: [''],
      maxDailyRate: [''],
      search: ['']
    });

    this.agentForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', Validators.required]
    });
  }

  private isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      return userData.role === 'ADMIN';
    } catch (error) {
      console.error('Error parsing user data:', error);
      return false;
    }
  }

  ngOnInit() {
    // Check if user is authenticated before loading data
    if (!this.isAuthenticated()) {
      console.log('Admin - User not authenticated, redirecting to login'); // Debug log
      // Clear any invalid data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    console.log('Admin - User authenticated, loading data'); // Debug log
    
    // Add a longer delay to ensure token is properly set in interceptor
    setTimeout(() => {
      console.log('Admin - Loading data after delay'); // Debug log
      this.loadAll();
      this.loadPendingAgents();
    }, 1000); // Increased delay to 1 second
  }

  loadAll() {
    this.isLoading = true;
    this.carService.getCars().pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (cars) => {
        this.cars = cars;
        this.filteredCars = cars;
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to load cars.');
      }
    });
    this.locationService.getLocations().subscribe({
      next: (locations) => this.locations = locations,
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to load locations.');
      }
    });
    this.reviewService.getRatings().subscribe({
      next: (reviews) => this.reviews = reviews,
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to load reviews.');
      }
    });
    this.bookingService.getAllBookings().subscribe({
      next: (bookings) => {
        this.bookings = bookings;
        this.totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to load bookings.');
      }
    });
  }

  loadPendingAgents() {
    this.adminService.getPendingAgents().subscribe({
      next: (res) => {
        this.pendingAgents = res.data || [];
        this.pendingAgentsError = '';
      },
      error: (err) => {
        this.pendingAgentsError = err?.error?.message || 'Failed to load pending agents.';
        this.pendingAgents = [];
      }
    });
  }

  approveAgent(agentId: string) {
    this.approvingAgentId = agentId;
    this.adminService.approveAgent(agentId).subscribe({
      next: (res) => {
        const agent = this.pendingAgents.find(a => a.id === agentId);
        const agentName = agent?.name || agent?.email || 'Agent';
        this.showToast(`✅ ${agentName} has been approved successfully! They can now log in and access the agent dashboard.`);
        this.loadPendingAgents();
      },
      error: (err) => {
        this.showToast(`❌ Failed to approve agent: ${err?.error?.message || 'Unknown error'}`);
      },
      complete: () => {
        this.approvingAgentId = null;
      }
    });
  }

  startCreateAgent() {
    this.agentForm.reset();
    this.showCreateAgentModal = true;
  }

  submitAgent() {
    if (this.agentForm.invalid) {
      return;
    }

    this.creatingAgent = true;
    const agentData = this.agentForm.value;

    this.adminService.createAgent(agentData).subscribe({
      next: (res) => {
        this.showToast(`✅ Agent ${agentData.name} created successfully! They will need approval before they can log in.`);
        this.showCreateAgentModal = false;
        this.loadPendingAgents();
      },
      error: (err) => {
        this.showToast(`❌ Failed to create agent: ${err?.error?.message || 'Unknown error'}`);
      },
      complete: () => {
        this.creatingAgent = false;
      }
    });
  }

  cancelCreateAgent() {
    this.showCreateAgentModal = false;
    this.agentForm.reset();
  }

  applyFilters() {
    const filters = this.filterForm.value;
    this.carService.filterCars(filters).subscribe(cars => {
      this.filteredCars = cars;
    });
  }

  searchCars() {
    const searchTerm = this.filterForm.get('search')?.value?.toLowerCase();
    if (!searchTerm) {
      this.filteredCars = this.cars;
      return;
    }
    this.filteredCars = this.cars.filter(car => 
      car.make.toLowerCase().includes(searchTerm) ||
      car.model.toLowerCase().includes(searchTerm) ||
      car.licensePlate.toLowerCase().includes(searchTerm)
    );
  }

  resetFilters() {
    this.filterForm.reset();
    this.filteredCars = this.cars;
  }

  startAddCar() {
    this.isEditMode = false;
    this.carForm.reset();
    this.carForm.patchValue({
      available: true,
      features: [],
      imageUrls: []
    });
    this.imageFiles = [];
    this.showAddCarModal = true;
  }

  startEditCar(car: Car) {
    this.isEditMode = true;
    this.carForm.patchValue({
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.licensePlate,
      category: car.category,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      doors: car.doors,
      dailyRate: car.dailyRate,
      hourlyRate: car.hourlyRate,
      available: car.available,
      locationId: car.locationId,
      imageUrls: car.imageUrls || []
    });

    // Set features
    const featuresArray = this.carForm.get('features') as FormArray;
    featuresArray.clear();
    if (car.features && car.features.length > 0) {
      car.features.forEach(feature => {
        featuresArray.push(this.fb.control(feature));
      });
    }

    this.showAddCarModal = true;
  }

  submitCar() {
    if (this.carForm.invalid) {
      return;
    }

    const carData = this.carForm.value;
    const featuresArray = this.carForm.get('features') as FormArray;
    carData.features = featuresArray.value.filter((f: string) => f.trim() !== '');

    // Remove fields not needed for creation
    delete carData.id;
    delete carData.images;
    if (!carData.hourlyRate) delete carData.hourlyRate;
    if (!carData.locationId) carData.locationId = undefined;
    if (!carData.imageUrls || carData.imageUrls.length === 0) delete carData.imageUrls;

    // Handle image upload with FormData if images are selected
    if (!this.isEditMode && this.imageFiles && this.imageFiles.length > 0) {
      const formData = new FormData();
      Object.entries(carData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, String(value));
          }
        }
      });
      this.imageFiles.forEach((file) => {
        formData.append('images', file);
      });
      this.carService.createCar(formData).subscribe({
        next: (car) => {
          this.showToast('Car added successfully!');
          this.loadAll();
          this.showAddCarModal = false;
        },
        error: (err) => {
          this.showToast(err?.error?.message || 'Failed to add car.');
        }
      });
    } else if (!this.isEditMode) {
      // No images, send plain object
      this.carService.createCar(carData).subscribe({
        next: (car) => {
          this.showToast('Car added successfully!');
          this.loadAll();
          this.showAddCarModal = false;
        },
        error: (err) => {
          this.showToast(err?.error?.message || 'Failed to add car.');
        }
      });
    } else {
      // Edit mode
      this.carService.updateCar(this.carForm.value.id, carData).subscribe({
        next: (car) => {
          this.showToast('Car updated successfully!');
          this.loadAll();
          this.showAddCarModal = false;
        },
        error: (err) => {
          this.showToast(err?.error?.message || 'Failed to update car.');
        }
      });
    }
  }

  cancelAddCar() {
    this.showAddCarModal = false;
    this.carForm.reset();
    this.imageFiles = [];
  }

  deleteCar(car: Car) {
    this.carToDelete = car;
    this.showToast(`Are you sure you want to delete ${car.make} ${car.model}?`, true);
  }

  confirmDelete() {
    if (!this.carToDelete) return;

    this.carService.deleteCar(this.carToDelete.id).subscribe({
      next: () => {
        this.showToast('Car deleted successfully!');
        this.loadAll();
        this.carToDelete = null;
        this.showDeleteConfirm = false;
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to delete car.');
        this.carToDelete = null;
        this.showDeleteConfirm = false;
      }
    });
  }

  cancelDelete() {
    this.carToDelete = null;
    this.showDeleteConfirm = false;
    this.toastMessage = '';
  }

  showToast(message: string, confirmDelete: boolean = false) {
    this.toastMessage = message;
    this.showDeleteConfirm = confirmDelete;
    setTimeout(() => {
      this.toastMessage = '';
      this.showDeleteConfirm = false;
    }, 5000);
  }

  toggleCarAvailability(car: Car) {
    this.carService.toggleAvailability(car.id).subscribe({
      next: () => {
        this.showToast(`Car ${car.available ? 'unavailable' : 'available'} successfully!`);
        this.loadAll();
      },
      error: (err) => {
        this.showToast(err?.error?.message || 'Failed to toggle car availability.');
      }
    });
  }

  onImageChange(event: any) {
    this.imageFiles = Array.from(event.target.files);
  }

  uploadImages(car: Car) {
    if (this.imageFiles.length === 0) return;

    this.carService.uploadImages(car.id, this.imageFiles).subscribe({
      next: () => {
        this.showToast('Images uploaded successfully!');
        this.loadAll();
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Failed to upload images.');
      }
    });
  }

  addFeature() {
    const featuresArray = this.carForm.get('features') as FormArray;
    featuresArray.push(this.fb.control(''));
  }

  removeFeature(i: number) {
    const featuresArray = this.carForm.get('features') as FormArray;
    featuresArray.removeAt(i);
  }

  get featuresArray(): FormControl[] {
    return (this.carForm.get('features') as FormArray).controls as FormControl[];
  }

  showCarDetails(car: Car) {
    this.selectedCar = car;
    this.showDetails = true;
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedCar = null;
  }

  public logout() {
    localStorage.clear();
    window.location.href = '/login';
  }

  setSection(section: 'cars' | 'bookings' | 'reviews') {
    this.dashboardSection = section;
  }

  editCar(car: Car) {
    this.startEditCar(car);
  }

  editReview(review: Review) {
    // Implementation for editing review
  }

  deleteReview(review: Review) {
    // Implementation for deleting review
  }

  acceptBooking(booking: Booking) {
    this.bookingService.confirmBooking(booking.id).subscribe({
      next: () => {
        this.showToast('Booking accepted successfully!');
        this.loadAll();
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Failed to accept booking.');
      }
    });
  }

  rejectBooking(booking: Booking) {
    this.bookingService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.showToast('Booking rejected successfully!');
        this.loadAll();
      },
      error: (err: any) => {
        this.showToast(err?.error?.message || 'Failed to reject booking.');
      }
    });
  }
}
