import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {GuestbookService} from "./service/guestbook.service";
import {FormsModule} from "@angular/forms";
import {Feedback} from "./feedback.interface";

@Component({
  selector: 'app-guestbook',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './guestbook.component.html',
  styleUrls: ['./guestbook.component.css']
})
export default class GuestbookComponent {
  feedbacks: Feedback[] = [];
  newFeedback = { comment: '', name: '', color: '#ffffff' };
  errorMessage: string = '';

  constructor(private guestbookService: GuestbookService) { }

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.guestbookService.getFeedback().subscribe(
      (data) => {
        this.feedbacks = data;
      },
      (error) => {
        console.error('Error fetching feedback:', error);
      }
    );
  }

  submitFeedback(): void {
    if (this.newFeedback.comment && this.newFeedback.name) {
      this.guestbookService.postFeedback(this.newFeedback).subscribe(
        (response) => {
          this.feedbacks.push(response);
          this.newFeedback = { comment: '', name: '', color: '#ffffff' };
        },
        (error) => {
          console.error('Error posting feedback:', error);
          if (error.error && error.error.errors) {
            this.showError(error.error.errors.map((e: { msg: any; }) => e.msg).join(', '));
          } else {
            this.showError('Error submitting feedback');
          }
        }
      );
    }
  }

  showError(message: string): void {
    this.errorMessage = message;
    setTimeout(() => {
      this.errorMessage = '';
    }, 5000); // Hide the error message after 5 seconds
  }

  selectColor(color: string): void {
    this.newFeedback.color = color;
  }

  textColor(color: string): string {
    return this.isLightColor(color) ? 'black' : 'white';
  }

  isLightColor(hexColor: string): boolean {
    // Convert hex to RGB
    const hex = hexColor.replace(/^#/, '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate perceived brightness
    const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // If brightness is greater than or equal to 128, the color is light
    return brightness >= 128;
  }
}
