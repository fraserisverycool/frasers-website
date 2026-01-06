import { Component, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import ColorPickerComponent from "../utils/color-picker/color-picker.component";
import {GuestbookService} from "./service/guestbook.service";
import {FormsModule} from "@angular/forms";
import {Feedback} from "./feedback.interface";
import {ImageService} from "../utils/services/image.service";

@Component({
    selector: 'app-guestbook',
    imports: [CommonModule, FormsModule, ColorPickerComponent],
    templateUrl: './guestbook.component.html',
    styleUrls: ['./guestbook.component.css']
})
export default class GuestbookComponent implements OnInit, AfterViewInit, OnDestroy {
  feedbacks: Feedback[] = [];
  newFeedback = { comment: '', name: '', color: '#ffffff' };
  errorMessage: string = '';

  pageSize = 10;
  itemsToShow = 10;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef;
  private observer!: IntersectionObserver;

  constructor(private guestbookService: GuestbookService, protected  imageService: ImageService) { }

  ngOnInit(): void {
    this.loadFeedback();
  }

  ngAfterViewInit(): void {
    this.setupIntersectionObserver();
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  setupIntersectionObserver(): void {
    this.observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        this.loadMore();
      }
    }, {
      rootMargin: '100px'
    });

    if (this.scrollAnchor) {
      this.observer.observe(this.scrollAnchor.nativeElement);
    }
  }

  loadMore(): void {
    if (this.itemsToShow < this.feedbacks.length) {
      this.itemsToShow += this.pageSize;
    }
  }

  loadFeedback(): void {
    this.guestbookService.getFeedback().subscribe(
      (data) => {
        this.feedbacks = [...data].reverse();
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
          this.feedbacks.unshift(response);
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
    }, 5000);
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
