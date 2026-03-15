import {Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output} from '@angular/core';
import { NgOptimizedImage, CommonModule } from '@angular/common';
import {CloseButtonComponent} from "../../../../utils/close-button/close-button.component";
import {RatingBarComponent} from "../../../../utils/rating-bar/rating-bar.component";
import {KKSong} from "../kk-song.interface";
import {ImageService} from "../../../../utils/services/image.service";
import {ClickedOutsideDirective} from "../../../../utils/directives/clicked-outside.directive";

@Component({
    selector: 'app-kk-modal',
    imports: [CloseButtonComponent, NgOptimizedImage, RatingBarComponent, ClickedOutsideDirective, CommonModule],
    templateUrl: './kk-modal.component.html',
    styleUrls: ['./kk-modal.component.css']
})
export class KkModalComponent implements OnInit, OnDestroy {
  @Input() selectedKkSong: KKSong | undefined;
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  audioFiles: string[] = [
    '2-01 Welcome Horizons (Radio).mp3', '2-02 K.K. Chorale (Radio).mp3', '2-03 K.K. March (Radio).mp3',
    '2-04 K.K. Waltz (Radio).mp3', '2-05 K.K. Swing (Radio).mp3', '2-06 K.K. Jazz (Radio).mp3',
    '2-07 K.K. Fusion (Radio).mp3', '2-08 K.K. Étude (Radio).mp3', '2-09 K.K. Lullaby (Radio).mp3',
    '2-10 K.K. Aria (Radio).mp3', '2-11 K.K. Samba (Radio).mp3', '2-12 K.K. Bossa (Radio).mp3',
    '2-13 K.K. Calypso (Radio).mp3', '2-14 K.K. Salsa (Radio).mp3', '2-15 K.K. Mambo (Radio).mp3',
    '2-16 K.K. Reggae (Radio).mp3', '2-17 K.K. Ska (Radio).mp3', '2-18 K.K. Tango (Radio).mp3',
    '2-19 K.K. Faire (Radio).mp3', '2-20 Aloha K.K. (Radio).mp3', '2-21 Lucky K.K. (Radio).mp3',
    '2-22 K.K. Condor (Radio).mp3', '2-23 K.K. Steppe (Radio).mp3', '2-24 Imperial K.K. (Radio).mp3',
    '2-25 K.K. Casbah (Radio).mp3', '2-26 K.K. Safari (Radio).mp3', '2-27 K.K. Folk (Radio).mp3',
    '2-28 K.K. Rock (Radio).mp3', '2-29 Rockin\' K.K. (Radio).mp3', '2-30 K.K. Ragtime (Radio).mp3',
    '2-31 K.K. Gumbo (Radio).mp3', '2-32 The K. Funk (Radio).mp3', '2-33 K.K. Blues (Radio).mp3',
    '2-34 Soulful K.K. (Radio).mp3', '2-35 K.K. Soul (Radio).mp3', '2-36 K.K. Cruisin\' (Radio).mp3',
    '2-37 K.K. Love Song (Radio).mp3', '2-38 K.K. D&B (Radio).mp3', '2-39 K.K. Technopop (Radio).mp3',
    '2-40 DJ K.K. (Radio).mp3', '2-41 Only Me (Radio).mp3', '2-42 K.K. Country (Radio).mp3',
    '2-43 Surfin\' K.K. (Radio).mp3', '2-44 K.K. Ballad (Radio).mp3', '2-45 Comrade K.K. (Radio).mp3',
    '2-46 K.K. Lament (Radio).mp3', '2-47 Go K.K. Rider! (Radio).mp3', '2-48 K.K. Dirge (Radio).mp3',
    '2-49 K.K. Western (Radio).mp3', '2-50 Mr. K.K. (Radio).mp3', '2-51 Café K.K. (Radio).mp3',
    '2-52 K.K. Parade (Radio).mp3', '2-53 Señor K.K. (Radio).mp3', '2-54 K.K. Song (Radio).mp3',
    '2-55 I Love You (Radio).mp3', '2-56 Two Days Ago (Radio).mp3', '2-57 My Place (Radio).mp3',
    '2-58 Forest Life (Radio).mp3', '2-59 To the Edge (Radio).mp3', '2-60 Pondering (Radio).mp3',
    '2-61 K.K. Dixie (Radio).mp3', '2-62 K.K. Marathon (Radio).mp3', '2-63 King K.K. (Radio).mp3',
    '2-64 Mountain Song (Radio).mp3', '2-65 Marine Song 2001 (Radio).mp3', '2-66 Neapolitan (Radio).mp3',
    '2-67 Steep Hill (Radio).mp3', '2-68 K.K. Rockabilly (Radio).mp3', '2-69 Agent K.K. (Radio).mp3',
    '2-70 K.K. Rally (Radio).mp3', '2-71 K.K. Metal (Radio).mp3', '2-72 Stale Cupcakes (Radio).mp3',
    '2-73 Spring Blossoms (Radio).mp3', '2-74 Wandering (Radio).mp3', '2-75 K.K. House (Radio).mp3',
    '2-76 K.K. Sonata (Radio).mp3', '2-77 Hypno K.K. (Radio).mp3', '2-78 K.K. Stroll (Radio).mp3',
    '2-79 K.K. Island (Radio).mp3', '2-80 Space K.K. (Radio).mp3', '2-81 K.K. Adventure (Radio).mp3',
    '2-82 K.K. Oasis (Radio).mp3', '2-83 K.K. Bazaar (Radio).mp3', '2-84 K.K. Milonga (Radio).mp3',
    '2-85 K.K. Groove (Radio).mp3', '2-86 K.K. Jongara (Radio).mp3', '2-87 K.K. Flamenco (Radio).mp3',
    '2-88 K.K. Moody (Radio).mp3', '2-89 Bubblegum K.K. (Radio).mp3', '2-90 K.K. Synth (Radio).mp3',
    '2-91 K.K. Disco (Radio).mp3', '2-92 K.K. Birthday (Radio).mp3', '2-93 Animal City (Radio).mp3',
    '2-94 Drivin\' (Radio).mp3', '2-95 Farewell (Radio).mp3'
  ];

  constructor(protected imageService: ImageService) {
  }

  getAudioUrl(): string | null {
    if (!this.selectedKkSong) return null;
    const title = this.selectedKkSong.title.toLowerCase();
    const match = this.audioFiles.find(f => {
      const fileName = f.toLowerCase();
      return fileName.includes(title) || title.includes(fileName.replace(/^\d+-\d+\s+/, '').replace(/\s+\(radio\)\.mp3$/, ''));
    });
    return match ? this.imageService.imageUrl('/music/nintendo/kk/audio/' + match) : null;
  }

  @HostListener('window:click', ['$event'])
  public onClick(event: MouseEvent) {
    event.stopPropagation();
  }

  ngOnInit() {
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
}
