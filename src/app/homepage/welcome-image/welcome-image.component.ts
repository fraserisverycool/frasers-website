import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-welcome-image',
  imports: [],
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
      this.selectedFile = input.files[0];
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
    this.http.post(`${this.apiUrl}/upload/welcome-image`, formData).subscribe({
      next: () => {
        this.uploadSuccess = true;
        this.isUploading = false;
        this.selectedFile = null;
        this.loadLatestImage();
      },
      error: () => {
        this.uploadError = 'Upload failed. Please try again.';
        this.isUploading = false;
      }
    });
  }
}
