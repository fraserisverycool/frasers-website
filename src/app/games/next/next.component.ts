import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-next',
  standalone: true,
  imports: [CommonModule, GamesComponent],
  templateUrl: './next.component.html',
  styleUrls: ['./next.component.css']
})
export default class NextComponent {
  playstationgames = [
    'Sable',
    'Tinykin',
    'Hardspace Shipbreaker',
    'Humanity'
  ];
  switchgames = [
    'Unsighted',
    'Live a Live',
    'Mega Man Battle Network',
    'Garden Story',
    'Oneshot',
    'Paranormasight',
    'Psuedoregalia',
    'Unicorn Overlord',
    'Duelists of Eden',
    'Morsels',
    'Iconoclasts',
    'Shinobi: Art of Vengeance'
  ];
  pcgames = [
    'Papers Please',
    'Road Warden',
    'Misericorde',
    'Lunistice',
    'Pokemon Infinite Fusion',
    'Shadows of Doubt',
    'Yellow Taxi Goes Vroom',
    'Zeroranger',
    'Quantum Witch',
    'Mouthwashing',
    'Arctic eggs',
    'Tactical breach wizards',
    'The Forgotten City',
    'Stephen\'s Sausage Rolls',
    'The Dark Queen of Mortholme',
    'Noita'
  ];
}
