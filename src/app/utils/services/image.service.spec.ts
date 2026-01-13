import { TestBed } from '@angular/core/testing';
import { ImageService } from './image.service';
import { environment } from '../../../environments/environment';

describe('ImageService', () => {
  let service: ImageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return a correct URL for a filename', () => {
    const filename = 'test.jpg';
    const expectedUrl = `${environment.imageBaseUrl}/${filename}`;
    expect(service.imageUrl(filename)).toEqual(expectedUrl);
  });

  it('should handle filenames that start with a slash', () => {
    const filename = '/test.jpg';
    const expectedUrl = `${environment.imageBaseUrl}/test.jpg`;
    expect(service.imageUrl(filename)).toEqual(expectedUrl);
  });

  it('should return only the base URL if filename is empty', () => {
    const filename = '';
    const expectedUrl = `${environment.imageBaseUrl}/`;
    expect(service.imageUrl(filename)).toEqual(expectedUrl);
  });
});
