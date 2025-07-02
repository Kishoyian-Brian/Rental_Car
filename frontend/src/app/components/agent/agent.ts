import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification-service';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-agent',
  imports: [CommonModule, DatePipe],
  templateUrl: './agent.html',
  styleUrl: './agent.css'
})
export class Agent implements OnInit {
  notifications: Notification[] = [];
  unreadCount: number = 0;
  approvalStatus: string = '';
  userName: string = '';

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.fetchNotifications();
    this.getApprovalStatus();
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

  getApprovalStatus() {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      this.approvalStatus = parsed.status;
      this.userName = parsed.name || '';
    }
  }

  showToast(message: string) {
    // Simple toast implementation (replace with your own if needed)
    alert(message);
  }
}
