import { Component, computed, inject, input, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {Photo} from "../photo.interface";
import {Secret} from "./secret.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {PhotoService} from "./service/photo.service";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-photo',
    imports: [FormsModule, NgOptimizedImage, RatingBarComponent, ImageUrlPipe],
    templateUrl: './photo.component.html',
    styleUrls: ['./photo.component.css']
})
export default class PhotoComponent {
  private service = inject(PhotoService);

  readonly photo = input<Photo>(<Photo>({
    filename: "",
    title: "",
    description: "",
    month: "",
    question: "",
    answer: [""],
    id: "",
    rating: [0, 0, 0, 0, 0, 0]
  }));

  readonly userAnswer = signal("");
  /** The secret returned by the server once the question has been answered correctly. */
  private readonly secret = signal<Secret | null>(null);
  readonly modalOpen = signal(false);

  readonly showText = computed(() => this.secret() !== null);
  readonly description = computed(() => this.secret()?.anecdote ?? this.photo().description);
  readonly displayedFilename = computed(() =>
    this.showText() ? this.secret()!.unmasked : this.photo().filename
  );

  checkAnswer(): void {
    this.service.postAnswer(this.photo().id, this.userAnswer()).subscribe({
      next: (secret) => this.secret.set(secret),
      error: () => alert('Incorrect answer. Please try again.'),
    });
  }

  openModal(): void {
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }
}
