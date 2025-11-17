import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() {}

  imageUrl(filename: string): string {
    const clean = filename.replace(/^\//, "");
    return `${environment.imageBaseUrl}/${clean}`;
  }
}
