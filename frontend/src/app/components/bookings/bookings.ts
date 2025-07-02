import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BookingService, Booking } from '../../services/booking-service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bookings',
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './bookings.html',
  styleUrl: './bookings.css'
})
export class Bookings implements OnInit {
  bookings: Booking[] = [];
  filteredBookings: Booking[] = [];
  selectedStatus: string = '';

  messageText: string = '';
  messageSuccess: boolean = false;
  messageError: string = '';

  constructor(private bookingService: BookingService, private router: Router) {}

  ngOnInit() {
    this.bookingService.getUserBookings().subscribe(bookings => {
      this.bookings = bookings;
      this.applyFilter();
    });
  }

  filterStatus(status: string) {
    this.selectedStatus = status;
    this.applyFilter();
  }

  applyFilter() {
    if (!this.selectedStatus) {
      this.filteredBookings = this.bookings;
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === this.selectedStatus);
    }
  }

  sendMessage() {
    this.messageSuccess = false;
    this.messageError = '';
    if (!this.messageText.trim()) {
      this.messageError = 'Message cannot be empty.';
      return;
    }
    // TODO: Replace with real API call to send message to agent/admin
    // For now, simulate success
    setTimeout(() => {
      this.messageSuccess = true;
      this.messageText = '';
      setTimeout(() => this.messageSuccess = false, 2000);
    }, 800);
  }

  onSignOut() {
    // Add your sign out logic here (e.g., clear tokens)
    // Redirect to landing page
    this.router.navigate(['/']);
  }
}
