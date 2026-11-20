import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { catchError, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ImageCompressionService } from './service/image-compression.service';

@Component({
  selector: 'app-welcome-image',
  imports: [FormsModule],
  templateUrl: './welcome-image.component.html',
  styleUrls: ['./welcome-image.component.css']
})
export class WelcomeImageComponent implements OnInit {
  private http = inject(HttpClient);
  private compressionService = inject(ImageCompressionService);

  private apiUrl = environment.apiUrl;
  private uploadBaseUrl = environment.uploadBaseUrl;
  readonly selectedFile = signal<File | null>(null);
  readonly uploadSuccess = signal(false);
  readonly uploadError = signal<string | null>(null);
  readonly isUploading = signal(false);
  readonly latestImageUrl = signal<string | null>(null);
  readonly password = signal('');
  readonly uploadProgress = signal(0);
  readonly isCompressing = signal(false);

  ngOnInit(): void {
    this.loadLatestImage();
  }

  loadLatestImage(): void {
    this.http.get<{ filename: string }>(`${this.apiUrl}/upload/welcome-image/latest`).pipe(
      timeout(6000),
      catchError(err => {
        console.error('Error loading latest image:', err);
        return throwError(() => err);
      })
    ).subscribe({
      next: (res) => {
        this.latestImageUrl.set(`${this.uploadBaseUrl}/welcome-image/${res.filename}`);
      },
      error: () => {
        this.latestImageUrl.set(null);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check for GIF
      if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
        this.uploadError.set('Tragically, GIF files are not supported. Please upload a static image (JPG, PNG, WEBP, etc.).');
        this.selectedFile.set(null);
        input.value = '';
        return;
      }

      // Check file size (e.g., limit to 20MB for initial selection, compression will shrink it)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadError.set(`Mate this picture is simply too big: (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 20MB.`);
        this.selectedFile.set(null);
        input.value = '';
        return;
      }

      this.selectedFile.set(file);
      this.uploadSuccess.set(false);
      this.uploadError.set(null);
    }
  }

  async onUpload(): Promise<void> {
    const selectedFile = this.selectedFile();
    if (!selectedFile) {
      this.uploadError.set('Please select an image first.');
      return;
    }
    if (!this.password()) {
      this.uploadError.set('You have to enter the password.');
      return;
    }

    this.isUploading.set(true);
    this.isCompressing.set(true);
    this.uploadError.set(null);
    this.uploadProgress.set(0);

    let fileToUpload = selectedFile;

    try {
      fileToUpload = await this.compressionService.compressImage(selectedFile);
    } catch (err) {
      console.error("I tried to compress your image but it didn't work:", err);
    } finally {
      this.isCompressing.set(false);
    }

    const formData = new FormData();
    formData.append('image', fileToUpload);
    formData.append('password', this.password());

    console.log(`Starting upload for ${fileToUpload.name} (${fileToUpload.size} bytes)`);

    this.http.post(`${this.apiUrl}/upload/welcome-image`, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      timeout(60000),
      catchError((err: any) => {
        console.error('Upload error details:', err);
        let errorMessage = 'Upload failed.';

        if (err.name === 'TimeoutError') {
          errorMessage = 'Upload timed out. The file might be too large or your connection is slow.';
        } else if (err.status === 0) {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.error && err.error.error) {
          errorMessage = err.error.error;
        } else if (err.message) {
          errorMessage = err.message;
        }

        return throwError(() => new Error(errorMessage));
      })
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress.set(Math.round(100 * event.loaded / (event.total || event.loaded)));
        } else if (event.type === HttpEventType.Response) {
          this.uploadSuccess.set(true);
          this.isUploading.set(false);
          this.selectedFile.set(null);
          this.password.set('');
          this.loadLatestImage();
        }
      },
      error: (err) => {
        this.uploadError.set(err.message);
        this.isUploading.set(false);
        this.uploadProgress.set(0);
      }
    });
  }
}
