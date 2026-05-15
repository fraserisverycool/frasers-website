import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadLatestImage();
  }

  loadLatestImage(): void {
    this.http.get<{ filename: string }>(`${this.apiUrl}/upload/welcome-image/latest`).subscribe({
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
      if (file.type === 'image/gif') {
        this.uploadError = 'GIF files are not supported. Please upload a static image (JPG, PNG, WEBP, etc.).';
        this.selectedFile = null;
        input.value = '';
        return;
      }
      this.selectedFile = file;
      this.uploadSuccess = false;
      this.uploadError = null;
    }
  }

  onUpload(): void {
    if (!this.selectedFile) {
      this.uploadError = 'Please select an image first.';
      return;
    }
    this.isUploading = true;
    this.uploadError = null;
    const formData = new FormData();
    formData.append('image', this.selectedFile);
    formData.append('password', this.password);
    this.http.post(`${this.apiUrl}/upload/welcome-image`, formData).subscribe({
      next: () => {
        this.uploadSuccess = true;
        this.isUploading = false;
        this.selectedFile = null;
        this.password = '';
        this.loadLatestImage();
      },
      error: (err) => {
        this.uploadError = err?.error?.error || 'Upload failed. Please try again.';
        this.isUploading = false;
      }
    });
  }
}
