import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {CloseButtonComponent} from "../../../../utils/close-button/close-button.component";
import {RatingBarComponent} from "../../../../utils/rating-bar/rating-bar.component";
import {KKSong} from "../kk-song.interface";

@Component({
  selector: 'app-kk-modal',
  standalone: true,
    imports: [CommonModule, CloseButtonComponent, NgOptimizedImage, RatingBarComponent],
  templateUrl: './kk-modal.component.html',
  styleUrls: ['./kk-modal.component.css']
})
export class KkModalComponent {
  @Input() selectedKkSong: KKSong | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
}
