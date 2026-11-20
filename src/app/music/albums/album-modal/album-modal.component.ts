import { Component, OnDestroy, OnInit, inject, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {Album} from "../album.interface";
import {AlbumsService} from "../service/albums.service";
import {RatingBarComponent} from "../../../utils/rating-bar/rating-bar.component";
import {CloseButtonComponent} from "../../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-album-modal',
  imports: [ClickedOutsideDirective, NgOptimizedImage, RatingBarComponent, CloseButtonComponent, ImageUrlPipe],
  templateUrl: './album-modal.component.html',
  styleUrls: ['./album-modal.component.css'],
  host: { '(window:popstate)': 'onPopState()' }
})
export class AlbumModalComponent implements OnInit, OnDestroy {
  private albumsService = inject(AlbumsService);

  readonly selectedAlbum = input<Album | undefined>();
  readonly close = output<void>();
  readonly currentRandomColor = signal("#ffffff");

  ngOnInit() {
    this.getRandomColor();
    history.pushState({ modal: true }, '');
  }

  onPopState() {
    this.close.emit();
  }

  ngOnDestroy() {
    if (window.history.state?.modal) {
      history.back();
    }
  }

  getRandomColor() {
    this.currentRandomColor.set(this.albumsService.getRandomColor());
  }
}
