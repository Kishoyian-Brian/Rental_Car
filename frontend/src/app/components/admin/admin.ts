import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CarService, Car } from '../../services/car-service';
import { LocationService, Location } from '../../services/location-service';
import { ReviewService, Review } from '../../services/review-service';
import { BookingService, Booking } from '../../services/booking-service';
import { finalize } from 'rxjs/operators';
import { CommonModule, CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.html',
  styleUrls: ['./admin.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    DecimalPipe
  ]
})
export class Admin implements OnInit {
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
  dashboardSection: 'cars' | 'bookings' | 'reviews' = 'cars';
  pendingDeleteCar: Car | null = null;
  showDeleteConfirm: boolean = false;

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
    private fb: FormBuilder
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
      imageUrls: [[]]
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
  }

  ngOnInit() {
    this.loadAll();
  }

  loadAll() {
    this.isLoading = true;
    this.carService.getCars().pipe(finalize(() => this.isLoading = false)).subscribe(cars => {
      this.cars = cars;
      this.filteredCars = cars;
    });
    this.locationService.getLocations().subscribe(locations => this.locations = locations);
    this.reviewService.getRatings().subscribe(reviews => this.reviews = reviews);
    this.bookingService.getUserBookings('all').subscribe(bookings => {
      this.bookings = bookings;
      // Calculate total revenue (placeholder: sum of totalPrice)
      this.totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    });
  }

  applyFilters() {
    const filters = this.filterForm.value;
    this.carService.filterCars(filters).subscribe(cars => {
      this.filteredCars = cars;
    });
  }

  searchCars() {
    const term = this.filterForm.value.search;
    if (!term) return this.applyFilters();
    this.carService.filterCars({ ...this.filterForm.value, q: term }).subscribe(cars => {
      this.filteredCars = cars;
    });
  }

  resetFilters() {
    this.filterForm.reset();
    this.loadAll();
  }

  startAddCar() {
    this.isEditMode = false;
    this.selectedCar = null;
    this.carForm.reset({ available: true, features: [] });
    this.featuresArray.clear();
    this.imageFiles = [];
    this.showDetails = false;
    this.showAddCarModal = true;
  }

  startEditCar(car: Car) {
    this.isEditMode = true;
    this.selectedCar = car;
    this.carForm.patchValue({ ...car });
    this.featuresArray.clear();
    (car.features || []).forEach(f => this.featuresArray.push(this.fb.control(f)));
    this.imageFiles = [];
    this.showDetails = false;
  }

  submitCar() {
    if (this.carForm.invalid) return;
    const formValue = this.carForm.value;
    const formData = new FormData();
    Object.entries(formValue).forEach(([key, value]) => {
      if (key === 'features') {
        formData.append('features', JSON.stringify(value));
      } else if (key === 'imageUrls') {
        // skip, handled by backend
      } else if (typeof value === 'string' || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === 'number' || typeof value === 'boolean') {
        formData.append(key, value.toString());
      }
    });
    this.imageFiles.forEach(file => formData.append('images', file));
    if (this.isEditMode && formValue.id) {
      this.carService.updateCar(formValue.id, formValue).subscribe({
        next: (res) => {
          if (res && res.ok) {
            this.loadAll();
            this.showAddCarModal = false;
            this.showToast('Car updated successfully!');
            this.carForm.reset({ available: true, features: [] });
            this.featuresArray.clear();
            this.imageFiles = [];
          } else {
            this.showToast(res?.message || 'Failed to update car.');
          }
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to update car.';
          this.showToast(msg);
        }
      });
    } else {
      this.carService.createCar(formData).subscribe(() => {
        this.loadAll();
        this.showAddCarModal = false;
        this.showToast('Car added successfully!');
        this.carForm.reset({ available: true, features: [] });
        this.featuresArray.clear();
        this.imageFiles = [];
      });
    }
  }

  cancelAddCar() {
    this.showAddCarModal = false;
    this.carForm.reset({ available: true, features: [] });
    this.featuresArray.clear();
    this.imageFiles = [];
  }

  deleteCar(car: Car) {
    this.pendingDeleteCar = car;
    this.showToast('Are you sure you want to delete this car?', true);
  }

  confirmDelete() {
    if (this.pendingDeleteCar) {
      this.carService.deleteCar(this.pendingDeleteCar.id).subscribe({
        next: (res) => {
          if (res && res.ok) {
            this.loadAll();
            this.showToast('Car deleted successfully!');
          } else {
            this.showToast(res?.message || 'Failed to delete car.');
          }
          this.pendingDeleteCar = null;
          this.showDeleteConfirm = false;
        },
        error: (err) => {
          const msg = err?.error?.message || 'Failed to delete car. It may have active bookings or you lack permission.';
          this.showToast(msg);
          this.pendingDeleteCar = null;
          this.showDeleteConfirm = false;
        }
      });
    }
  }

  cancelDelete() {
    this.pendingDeleteCar = null;
    this.showDeleteConfirm = false;
    this.toastMessage = '';
  }

  showToast(message: string, confirmDelete: boolean = false) {
    this.toastMessage = message;
    this.showDeleteConfirm = confirmDelete;
    if (!confirmDelete) {
      setTimeout(() => {
        this.toastMessage = '';
      }, 2000);
    }
  }

  toggleCarAvailability(car: Car) {
    this.carService.toggleAvailability(car.id).subscribe(updated => {
      car.available = updated.available;
    });
  }

  onImageChange(event: any) {
    if (event.target.files) {
      this.imageFiles = Array.from(event.target.files);
    }
  }

  uploadImages(car: Car) {
    if (this.imageFiles.length === 0) return;
    this.carService.uploadImages(car.id, this.imageFiles).subscribe(updated => {
      car.imageUrls = updated.imageUrls;
      this.imageFiles = [];
    });
  }

  addFeature() {
    this.featuresArray.push(this.fb.control(''));
  }

  removeFeature(i: number) {
    this.featuresArray.removeAt(i);
  }

  get featuresArray() {
    return this.carForm.get('features') as FormArray;
  }

  get featuresControls() {
    return this.featuresArray.controls as FormControl[];
  }

  showCarDetails(car: Car) {
    this.selectedCar = car;
    this.showDetails = true;
    this.reviewService.getRatings().subscribe(reviews => {
      this.carReviews = reviews.filter(r => r.carId === car.id);
    });
    // Optionally, fetch bookings for this car if backend supports it
    // this.bookingService.getBookingsForCar(car.id).subscribe(bookings => this.carBookings = bookings);
  }

  closeDetails() {
    this.showDetails = false;
    this.selectedCar = null;
    this.carReviews = [];
    this.carBookings = [];
  }

  public logout() {
    localStorage.clear();
    window.location.reload();
  }

  setSection(section: 'cars' | 'bookings' | 'reviews') {
    this.dashboardSection = section;
  }

  editCar(car: Car) {
    this.startEditCar(car);
    this.showAddCarModal = true;
  }

  editReview(review: Review) {
    // Placeholder for review edit logic
    this.showToast('Edit review not implemented');
  }

  deleteReview(review: Review) {
    // Placeholder for review delete logic
    this.showToast('Delete review not implemented');
  }

  acceptBooking(booking: Booking) {
    this.bookingService.confirmBooking(booking.id).subscribe({
      next: (res) => {
        if (res && res.ok) {
          this.showToast('Booking accepted!');
          this.loadAll();
        } else {
          this.showToast(res?.message || 'Failed to accept booking.');
        }
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to accept booking.';
        this.showToast(msg);
      }
    });
  }

  rejectBooking(booking: Booking) {
    this.bookingService.cancelBooking(booking.id).subscribe({
      next: (res) => {
        if (res && res.ok) {
          this.showToast('Booking rejected!');
          this.loadAll();
        } else {
          this.showToast(res?.message || 'Failed to reject booking.');
        }
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to reject booking.';
        this.showToast(msg);
      }
    });
  }
}
