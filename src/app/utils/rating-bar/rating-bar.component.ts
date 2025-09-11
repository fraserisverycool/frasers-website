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
  filenames: string[] = ['reaction-wet.png', 'reaction-poo.png', 'reaction-hurr.png', 'reaction-peace.png', 'reaction-science.png'];

  onSelect(index: number): void {
    if (this.selectedIndex !== null) return;
    this.selectedIndex = index;
    this.counts[index] += 1;
  }
}
