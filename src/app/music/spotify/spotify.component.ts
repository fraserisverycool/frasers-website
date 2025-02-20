import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DividerComponent } from './divider/divider.component'

@Component({
  selector: 'app-spotify',
  standalone: true,
  imports: [CommonModule, DividerComponent],
  templateUrl: './spotify.component.html',
  styleUrls: ['./spotify.component.css']
})
export default class SpotifyComponent {

}
