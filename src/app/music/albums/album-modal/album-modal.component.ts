import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {ClickedOutsideDirective} from "../../../utils/directives/clicked-outside.directive";
import {Album} from "../album.interface";
import {AlbumsService} from "../albums.service";

@Component({
  selector: 'app-album-modal',
  standalone: true,
    imports: [CommonModule, ClickedOutsideDirective, NgOptimizedImage],
  templateUrl: './album-modal.component.html',
  styleUrls: ['./album-modal.component.css']
})
export class AlbumModalComponent implements OnInit{
  @Input() selectedAlbum: Album | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();
  currentRandomColor: string = "#ffffff";

  constructor(private albumsService: AlbumsService) {
  }

  ngOnInit() {
    this.getRandomColor();
  }

  getRandomColor() {
    this.currentRandomColor = this.albumsService.getRandomColor();
  }
}
