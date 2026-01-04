import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {Album} from "../album.interface";
import {AlbumsService} from "../service/albums.service";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageService} from "../../../utils/services/image.service";

@Component({
    selector: 'app-album-modal',
    imports: [ClickedOutsideDirective, NgOptimizedImage, RatingBarComponent, CloseButtonComponent],
    templateUrl: './album-modal.component.html',
    styleUrls: ['./album-modal.component.css']
})
export class AlbumModalComponent implements OnInit, OnDestroy {
  @Input() selectedAlbum: Album | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  currentRandomColor: string = "#ffffff";

  constructor(private albumsService: AlbumsService, protected imageService: ImageService) {
  }

  ngOnInit() {
    this.getRandomColor();
    history.pushState({ modal: true }, '');
  }

  @HostListener('window:popstate')
  onPopState() {
    this.close.emit();
  }

  ngOnDestroy() {
    if (window.history.state?.modal) {
      history.back();
    }
  }

  getRandomColor() {
    this.currentRandomColor = this.albumsService.getRandomColor();
  }
}
