import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {Soundtrack} from "../soundtrack.interface";
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";

@Component({
  selector: 'app-soundtrack-modal',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage, ClickedOutsideDirective],
  templateUrl: './soundtrack-modal.component.html',
  styleUrls: ['./soundtrack-modal.component.css']
})
export class SoundtrackModalComponent implements OnInit {
  @Input() selectedSoundtrack: Soundtrack | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  currentRandomColor: string = "#ffffff";

  ngOnInit() {
    this.getRandomColor();
  }

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    this.currentRandomColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
