import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BookingService, Booking } from '../../services/booking-service';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule, DatePipe],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookings: Booking[] = [];
  userId: string = '';

  constructor(private bookingService: BookingService) {}

  ngOnInit() {
    // Get userId from localStorage (or use a user service if available)
    const user = localStorage.getItem('currentUser');
    if (user) {
      this.userId = JSON.parse(user).id;
      this.bookingService.getUserBookings(this.userId).subscribe(bookings => {
        this.bookings = bookings;
      });
    }
  }
}
