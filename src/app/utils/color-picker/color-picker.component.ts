import { Component, model } from '@angular/core';

@Component({
    selector: 'app-color-picker',
    templateUrl: './color-picker.component.html',
    styleUrls: ['./color-picker.component.css']
})
export default class ColorPickerComponent {
  /** Two-way bindable: use `[(color)]="someSignal"` in the parent. */
  readonly color = model<string>('');

  readonly swatches = [
    { value: '#ffffff', label: 'White' },
    { value: '#3498db', label: 'Blue' },
    { value: '#e74c3c', label: 'Terracotta' },
    { value: '#00632a', label: 'Dark Green' },
    { value: '#f54ee7', label: 'Pink' },
    { value: '#b51016', label: 'Red' },
    { value: '#f1c40f', label: 'Yellow' },
    { value: '#16a085', label: 'Olive' },
    { value: '#0e37c9', label: 'Dark Blue' },
    { value: '#8e44ad', label: 'Purple' },
    { value: '#2c3e50', label: 'Dark Grey' },
    { value: '#95a5a6', label: 'Grey' },
    { value: '#4CAF50', label: 'Green' },
    { value: '#ff5500', label: 'Orange' },
    { value: '#55d4c3', label: 'Cyan' },
    { value: '#8BC34A', label: 'Light Green' },
    { value: '#57290a', label: 'Brown' },
  ];

  selectColor(color: string): void {
    this.color.set(color);
  }
}
