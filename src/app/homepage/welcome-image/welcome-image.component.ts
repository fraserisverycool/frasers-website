import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { catchError, timeout } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { ImageCompressionService } from './service/image-compression.service';

@Component({
  selector: 'app-welcome-image',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './welcome-image.component.html',
  styleUrls: ['./welcome-image.component.css']
})
export class WelcomeImageComponent implements OnInit {
  private apiUrl = environment.apiUrl;
  private uploadBaseUrl = environment.uploadBaseUrl;
  selectedFile: File | null = null;
  uploadSuccess: boolean = false;
  uploadError: string | null = null;
  isUploading: boolean = false;
  latestImageUrl: string | null = null;
  password: string = '';
  uploadProgress: number = 0;
  isCompressing: boolean = false;

  constructor(private http: HttpClient, private compressionService: ImageCompressionService) {}

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
        this.latestImageUrl = `${this.uploadBaseUrl}/welcome-image/${res.filename}`;
      },
      error: () => {
        this.latestImageUrl = null;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Check for GIF
      if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
        this.uploadError = 'Tragically, GIF files are not supported. Please upload a static image (JPG, PNG, WEBP, etc.).';
        this.selectedFile = null;
        input.value = '';
        return;
      }

      // Check file size (e.g., limit to 20MB for initial selection, compression will shrink it)
      const maxSize = 20 * 1024 * 1024;
      if (file.size > maxSize) {
        this.uploadError = `Mate this picture is simply too big: (${(file.size / 1024 / 1024).toFixed(1)}MB). Max size is 20MB.`;
        this.selectedFile = null;
        input.value = '';
        return;
      }

      this.selectedFile = file;
      this.uploadSuccess = false;
      this.uploadError = null;
    }
  }

  async onUpload(): Promise<void> {
    if (!this.selectedFile) {
      this.uploadError = 'Please select an image first.';
      return;
    }
    if (!this.password) {
      this.uploadError = 'You have to enter the password.';
      return;
    }

    this.isUploading = true;
    this.isCompressing = true;
    this.uploadError = null;
    this.uploadProgress = 0;

    let fileToUpload = this.selectedFile;

    try {
      fileToUpload = await this.compressionService.compressImage(this.selectedFile);
    } catch (err) {
      console.error("I tried to compress your image but it didn't work:", err);
    } finally {
      this.isCompressing = false;
    }

    const formData = new FormData();
    formData.append('image', fileToUpload);
    formData.append('password', this.password);

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
          this.uploadProgress = Math.round(100 * event.loaded / (event.total || event.loaded));
        } else if (event.type === HttpEventType.Response) {
          this.uploadSuccess = true;
          this.isUploading = false;
          this.selectedFile = null;
          this.password = '';
          this.loadLatestImage();
        }
      },
      error: (err) => {
        this.uploadError = err.message;
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }
}
