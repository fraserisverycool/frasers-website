import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import GamesComponent from "../games.component";

@Component({
  selector: 'app-next',
  standalone: true,
  imports: [CommonModule, GamesComponent],
  templateUrl: './next-game.component.html',
  styleUrls: ['./next-game.component.css']
})
export default class NextGameComponent {
  playstationgames = [
    'Sable',
    'Tinykin',
    'Hardspace Shipbreaker',
    'Humanity',
    'Clair Obscur: Expedition 33'
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
    'Noita',
    'Rimworld',
    'Consume me'
  ];
}
