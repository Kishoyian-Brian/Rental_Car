import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CarService } from '../../services/car-service';
import { ReviewService } from '../../services/review-service';

@Component({
  selector: 'app-landingpage',
  imports: [CommonModule, RouterModule],
  templateUrl: './landingpage.html',
  styleUrl: './landingpage.css'
})
export class Landingpage implements OnInit {
  cars: any[] = [];
  ratings: any[] = [];

  constructor(private carService: CarService, private reviewService: ReviewService) {}

  ngOnInit() {
    this.carService.getCars().subscribe((cars) => {
      this.cars = cars.slice(0, 3);
    });
    this.reviewService.getRatings().subscribe((ratings) => {
      this.ratings = ratings;
    });
  }
}
