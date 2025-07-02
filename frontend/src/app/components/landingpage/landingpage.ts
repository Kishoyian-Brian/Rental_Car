import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CarService } from '../../services/car-service';
import { ReviewService } from '../../services/review-service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landingpage',
  imports: [CommonModule, RouterModule],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css'
})
export class Landingpage implements OnInit {
  cars: any[] = [];
  ratings: any[] = [];

  selectedCar: any = null;
  showDetailsModal = false;

  dropdownOpen: boolean = false;

  constructor(
    private carService: CarService,
    private reviewService: ReviewService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/user-dashboard']);
      return;
    }
    this.carService.getCars().subscribe((cars) => {
      this.cars = cars.slice(0, 3);
    });
    this.reviewService.getRatings().subscribe((ratings) => {
      this.ratings = ratings;
    });
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  viewDetails(car: any) {
    this.selectedCar = car;
    this.showDetailsModal = true;
    this.dropdownOpen = false; 
  }

  closeDetailsModal() {
    this.showDetailsModal = false;
    this.selectedCar = null;
  }
}
