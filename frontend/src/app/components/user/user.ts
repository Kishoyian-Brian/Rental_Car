import { Component, OnInit, OnDestroy } from '@angular/core';
import { CarService } from '../../services/car-service';
import { LocationService, Location } from '../../services/location-service';
import { BookingService } from '../../services/booking-service';
import { Router } from '@angular/router';
import { NotificationService, Notification } from '../../services/notification-service';
import { AuthService } from '../../services/auth.service';
import { ReviewService, Review } from '../../services/review-service';

@Component({
  selector: 'app-user',
  templateUrl: './user.html',
  styleUrl: './user.css',
  standalone: false
})
export class User implements OnInit, OnDestroy {
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
  bookingError: string = '';
  bookingLoading: boolean = false;

  notifications: Notification[] = [];
  unreadCount: number = 0;
  showNotificationsDropdown: boolean = false;
  showProfileDropdown: boolean = false;
  notificationInterval: any;

  userProfile: any = null;

  editingProfile: boolean = false;
  editProfileData: any = { name: '', email: '', password: '' };
  profileUpdateSuccess: boolean = false;
  profileUpdateError: string = '';

  carReviews: Review[] = [];
  reviewForm = { rating: 5, comment: '' };
  reviewSubmitting: boolean = false;
  reviewSuccess: boolean = false;
  reviewError: string = '';
  hasReviewed: boolean = false;

  constructor(
    private carService: CarService,
    private locationService: LocationService,
    private bookingService: BookingService,
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) {}

  ngOnInit() {
    this.loadCars();
    this.locationService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
      },
      error: (err) => {
        this.showToast?.(err?.error?.message || 'Failed to load locations.');
      }
    });
    this.fetchNotifications();
    this.notificationInterval = setInterval(() => this.fetchNotifications(), 30000);
    this.fetchUserProfile();
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    if (this.notificationInterval) clearInterval(this.notificationInterval);
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  fetchNotifications() {
    this.notificationService.getMyNotifications().subscribe({
      next: (notifs) => {
        this.notifications = notifs;
        this.unreadCount = notifs.filter(n => !n.read).length;
      },
      error: (err) => {
        this.showToast?.(err?.error?.message || 'Failed to load notifications.');
      }
    });
  }

  loadCars() {
    this.carService.getCars().subscribe({
      next: (cars) => {
        this.allCars = cars;
        this.applyFilters();
      },
      error: (err) => {
        this.showToast?.(err?.error?.message || 'Failed to load cars.');
      }
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
    this.loadCarReviews(car.id);
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
      this.bookingError = 'Please fill in all fields.';
      return;
    }
    if (this.bookingEndDate < this.bookingStartDate) {
      this.bookingSuccess = false;
      this.bookingError = 'End date must be after start date.';
      return;
    }
    this.bookingLoading = true;
    this.bookingError = '';
    this.bookingService.createBooking({
      carId: this.selectedCar.id,
      startDate: this.bookingStartDate,
      endDate: this.bookingEndDate,
      locationId: this.bookingLocationId
    }).subscribe({
      next: () => {
        this.bookingSuccess = true;
        this.bookingError = '';
        this.bookingLoading = false;
        this.closeModal();
        this.router.navigate(['/user-bookings']);
      },
      error: (err) => {
        this.bookingSuccess = false;
        this.bookingLoading = false;
        this.bookingError = err?.error?.message || 'Failed to book car.';
      }
    });
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  fetchUserProfile() {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
      },
      error: (err) => {
        this.showToast?.(err?.error?.message || 'Failed to load user profile.');
      }
    });
  }

  toggleNotificationsDropdown() {
    this.showNotificationsDropdown = !this.showNotificationsDropdown;
    if (this.showNotificationsDropdown) {
      this.showProfileDropdown = false;
      this.markAllAsRead();
    }
  }

  toggleProfileDropdown() {
    this.showProfileDropdown = !this.showProfileDropdown;
    if (this.showProfileDropdown) {
      this.showNotificationsDropdown = false;
      this.editingProfile = false;
      this.profileUpdateSuccess = false;
      this.profileUpdateError = '';
    }
  }

  handleClickOutside(event: MouseEvent) {
    const notifWrapper = document.querySelectorAll('.icon-wrapper');
    let clickedInside = false;
    notifWrapper.forEach(wrapper => {
      if (wrapper.contains(event.target as Node)) {
        clickedInside = true;
      }
    });
    if (!clickedInside) {
      this.showNotificationsDropdown = false;
      this.showProfileDropdown = false;
    }
  }

  markAllAsRead() {
    const unread = this.notifications.filter(n => !n.read);
    unread.forEach(n => {
      this.notificationService.markAsRead(n.id).subscribe(() => {
        n.read = true;
        this.unreadCount = this.notifications.filter(x => !x.read).length;
      });
    });
  }

  startEditProfile() {
    this.editingProfile = true;
    this.editProfileData = {
      name: this.userProfile?.name || '',
      email: this.userProfile?.email || '',
      password: ''
    };
    this.profileUpdateSuccess = false;
    this.profileUpdateError = '';
  }

  cancelEditProfile() {
    this.editingProfile = false;
    this.profileUpdateSuccess = false;
    this.profileUpdateError = '';
  }

  submitEditProfile() {
    const updateData: any = {
      name: this.editProfileData.name,
      email: this.editProfileData.email
    };
    if (this.editProfileData.password) {
      updateData.password = this.editProfileData.password;
    }
    this.authService.updateProfile(updateData).subscribe({
      next: (updated) => {
        this.userProfile = updated;
        this.profileUpdateSuccess = true;
        this.profileUpdateError = '';
        this.editingProfile = false;
      },
      error: (err) => {
        this.profileUpdateSuccess = false;
        this.profileUpdateError = err?.error?.message || 'Failed to update profile.';
      }
    });
  }

  loadCarReviews(carId: string) {
    this.reviewService.getReviewsByCar(carId).subscribe(reviews => {
      this.carReviews = reviews;
      const user = localStorage.getItem('user');
      const userId = user ? JSON.parse(user).id : null;
      this.hasReviewed = !!reviews.find(r => r.userId === userId);
    });
  }

  submitReview() {
    if (!this.selectedCar) return;
    this.reviewSubmitting = true;
    this.reviewError = '';
    this.reviewSuccess = false;
    this.reviewService.createReview({
      rating: this.reviewForm.rating,
      comment: this.reviewForm.comment,
      carId: this.selectedCar.id
    }).subscribe({
      next: () => {
        this.reviewSuccess = true;
        this.reviewSubmitting = false;
        this.reviewForm = { rating: 5, comment: '' };
        this.loadCarReviews(this.selectedCar.id);
      },
      error: (err) => {
        this.reviewError = err?.error?.message || 'Failed to submit review.';
        this.reviewSubmitting = false;
      }
    });
  }

  goToBookings() {
    this.router.navigate(['/user-bookings']);
  }

  showToast(message: string) {
    // Simple toast implementation (replace with your own if needed)
    alert(message);
  }
}
