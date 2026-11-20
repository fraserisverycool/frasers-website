import { ImageUrlPipe } from './image-url.pipe';
import { environment } from '../../../environments/environment';

describe('ImageUrlPipe', () => {
  let pipe: ImageUrlPipe;

  beforeEach(() => {
    pipe = new ImageUrlPipe();
  });

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return empty string for null or undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should strip leading slashes and append to environment.imageBaseUrl', () => {
    expect(pipe.transform('films/poster.jpg')).toBe(`${environment.imageBaseUrl}/films/poster.jpg`);
    expect(pipe.transform('/films/poster.jpg')).toBe(`${environment.imageBaseUrl}/films/poster.jpg`);
    expect(pipe.transform('///films/poster.jpg')).toBe(`${environment.imageBaseUrl}/films/poster.jpg`);
  });
});
