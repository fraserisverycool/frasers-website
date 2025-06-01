import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.css']
})
export default class ColorPickerComponent {
  @Input() color: string = '';
  @Output() colorChange = new EventEmitter<string>();

  selectColor(color: string): void {
    this.color = color;
    this.colorChange.emit(color);
  }
}
