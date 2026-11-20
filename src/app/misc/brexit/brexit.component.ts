import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgOptimizedImage } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { ImageUrlPipe } from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-brexit',
    imports: [NgOptimizedImage, ImageUrlPipe],
    templateUrl: './brexit.component.html',
    styleUrls: ['./brexit.component.css'],
    host: { '(window:popstate)': 'onPopState()' }
})
export default class BrexitComponent {
  private http = inject(HttpClient);

  readonly images = toSignal(
    this.http.get<{ filenames: string[] }>('assets/data/brexit-summits.json').pipe(
      map(data => data.filenames),
      catchError(err => {
        console.error('Failed to load image filenames:', err);
        return of([] as string[]);
      })
    ),
    { initialValue: [] as string[] }
  );
  readonly selectedImage = signal<string | null>(null);

  openImage(image: string): void {
    this.selectedImage.set(image);
    history.pushState({ modal: true }, '');
  }

  onPopState() {
    if (this.selectedImage()) {
      this.selectedImage.set(null);
    }
  }

  closeImage(): void {
    this.selectedImage.set(null);
    if (window.history.state?.modal) {
      history.back();
    }
  }
}
