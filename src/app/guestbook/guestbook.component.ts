import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Field, form, required, submit } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import ColorPickerComponent from "../utils/color-picker/color-picker.component";
import {GuestbookService} from "./service/guestbook.service";
import {Feedback} from "./feedback.interface";
import {InfiniteScrollDirective} from "../utils/directives/infinite-scroll.directive";
import {ImageUrlPipe} from "../utils/pipes/image-url.pipe";

interface NewFeedback {
  comment: string;
  name: string;
  color: string;
}

const EMPTY_FEEDBACK: NewFeedback = { comment: '', name: '', color: '#ffffff' };

@Component({
    selector: 'app-guestbook',
    imports: [DatePipe, Field, ColorPickerComponent, InfiniteScrollDirective, ImageUrlPipe],
    templateUrl: './guestbook.component.html',
    styleUrls: ['./guestbook.component.css']
})
export default class GuestbookComponent implements OnInit {
  private guestbookService = inject(GuestbookService);
  private destroyRef = inject(DestroyRef);

  readonly feedbacks = signal<Feedback[]>([]);

  /** Signal Forms: the model is a plain signal, the form is derived from it. */
  readonly newFeedback = signal<NewFeedback>({ ...EMPTY_FEEDBACK });
  readonly feedbackForm = form(this.newFeedback, (path) => {
    required(path.comment);
    required(path.name);
  });

  readonly errorMessage = signal('');

  private readonly pageSize = 10;
  readonly itemsToShow = signal(this.pageSize);
  readonly visibleFeedbacks = computed(() => this.feedbacks().slice(0, this.itemsToShow()));

  ngOnInit(): void {
    this.guestbookService.getFeedback().subscribe({
      next: (data) => this.feedbacks.set([...data].reverse()),
      error: (error) => console.error('Error fetching feedback:', error),
    });
  }

  loadMore(): void {
    if (this.itemsToShow() < this.feedbacks().length) {
      this.itemsToShow.update(n => n + this.pageSize);
    }
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    // `submit` marks every field as touched and only runs the action when the form is valid.
    submit(this.feedbackForm, async (f) => {
      try {
        const response = await firstValueFrom(this.guestbookService.postFeedback(f().value()));
        this.feedbacks.update(list => [response, ...list]);
        this.newFeedback.set({ ...EMPTY_FEEDBACK });
        f().reset();
      } catch (error: any) {
        console.error('Error posting feedback:', error);
        if (error?.error?.errors) {
          this.showError(error.error.errors.map((e: { msg: string }) => e.msg).join(', '));
        } else {
          this.showError('Error submitting feedback');
        }
      }
      return undefined;
    });
  }

  selectColor(color: string): void {
    this.newFeedback.update(f => ({ ...f, color }));
  }

  showError(message: string): void {
    this.errorMessage.set(message);
    const timer = setTimeout(() => this.errorMessage.set(''), 5000);
    this.destroyRef.onDestroy(() => clearTimeout(timer));
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
