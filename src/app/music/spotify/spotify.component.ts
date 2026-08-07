import { Component } from '@angular/core';

import { DividerComponent } from './divider/divider.component'

@Component({
  selector: 'app-spotify',
  imports: [DividerComponent],
  templateUrl: './spotify.component.html',
  standalone: true,
  styleUrls: ['./spotify.component.css']
})
export default class SpotifyComponent {

}
