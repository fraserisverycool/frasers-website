import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AlbumsService {

  constructor() { }

  generateRainbowColor(year: string | number): string {
    console.log(year);
    // Parse the year if it's a string
    let yearNumber: number;
    if (typeof year === 'string') {
      yearNumber = parseInt(year, 10);
      if (isNaN(yearNumber)) {
        throw new Error("Invalid year string. Please enter a valid year.");
      }
    } else if (typeof year === 'number') {
      yearNumber = year;
    } else {
      throw new Error("Year must be a string or a number.");
    }

    // Ensure the year is within the specified range
    if (yearNumber < 1970 || yearNumber > 2030) {
      throw new Error("Year must be between 1970 and 2030.");
    }

    // Define RGB values for each color of the rainbow
    const rainbowColors = [
      { year: 1970, rgb: [255, 0, 0] }, // Red
      { year: 1980, rgb: [255, 165, 0] }, // Orange
      { year: 1990, rgb: [255, 255, 0] }, // Yellow
      { year: 2000, rgb: [0, 128, 0] }, // Green
      { year: 2010, rgb: [0, 0, 255] }, // Blue
      { year: 2020, rgb: [75, 0, 130] }, // Indigo
      { year: 2030, rgb: [128, 0, 128] }, // Violet
    ];

    // Find the two colors to interpolate between
    let startColor, endColor;
    for (let i = 0; i < rainbowColors.length - 1; i++) {
      if (rainbowColors[i].year <= yearNumber && yearNumber <= rainbowColors[i + 1].year) {
        startColor = rainbowColors[i];
        endColor = rainbowColors[i + 1];
        break;
      }
    }

    if (!startColor || !endColor) {
      throw new Error("Failed to find colors for interpolation.");
    }

    // Calculate the fraction of the range between the two colors
    const yearFraction = (yearNumber - startColor.year) / (endColor.year - startColor.year);

    // Interpolate between the start and end RGB values based on the year fraction
    const interpolatedRGB = [
      this.interpolate(startColor.rgb[0], endColor.rgb[0], yearFraction),
      this.interpolate(startColor.rgb[1], endColor.rgb[1], yearFraction),
      this.interpolate(startColor.rgb[2], endColor.rgb[2], yearFraction)
    ];

    const mutedRGB = this.muteColor(interpolatedRGB);

    // Convert the RGB values to a hex color string
    let generatedColour = this.rgbToHex(mutedRGB[0], mutedRGB[1], mutedRGB[2]);
    console.log(generatedColour)
    return generatedColour;
  }

  // Helper function to interpolate between two values
  interpolate(start: number, end: number, fraction: number): number {
    return start + (end - start) * fraction;
  }

  // Helper function to mute a color by adding grey
  muteColor(rgb: number[]): number[] {
    const greyLevel = 128; // Adjust this value to control the level of muting
    const mutedRGB = [
      Math.floor((rgb[0] + greyLevel) / 2),
      Math.floor((rgb[1] + greyLevel) / 2),
      Math.floor((rgb[2] + greyLevel) / 2)
    ];
    return mutedRGB;
  }

  // Helper function to convert RGB to hex
  rgbToHex(r: number, g: number, b: number): string {
    return `#${Math.floor(r).toString(16).padStart(2, '0')}${Math.floor(g).toString(16).padStart(2, '0')}${Math.floor(b).toString(16).padStart(2, '0')}`;
  }

  generateTextColor(year: string | number): string {
    return this.isLightColor(this.generateRainbowColor(year)) ? 'black' : 'white';
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

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
