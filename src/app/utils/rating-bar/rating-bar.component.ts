import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-bar.component.html',
  styleUrls: ['./rating-bar.component.css']
})
export class RatingBarComponent {
  @Input() counts: number[] = [0, 0, 0, 0, 0];
  selectedIndex: number | null = null;
  colors: string[] = ['#e74c3c', '#f39c12', '#f1c40f', '#2ecc71', '#3498db'];

  onSelect(index: number): void {
    if (this.selectedIndex !== null) return;
    this.selectedIndex = index;
    this.counts[index] += 1;
  }
}
