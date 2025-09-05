import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import FilmsComponent from "../films.component";

@Component({
  selector: 'app-next',
  standalone: true,
  imports: [CommonModule, FilmsComponent],
  templateUrl: './next.component.html',
  styleUrls: ['./next.component.css']
})
export default class NextComponent {
  films = [
    'Lurker', 'Moonstruck', 'Streets of Fire', 'Gladiator',
    'Black Orpheus', 'Hereditary', 'Where Dragons Live', 'Painted boats',
    'Labyrinth', 'Playtime', 'Black Christmas', 'Wings', 'The Trial',
    'Mulholland Drive', 'Pink Flamingos', "I'm Still Here",
    'Queer', 'Nickel Boys', 'The Seed of the Sacred Fig', 'Inline Empire',
    'Aftersun', "It's Such a Beautiful Day", 'The Host',
    'Boys Go to Jupiter', 'My Favourite Cake', 'Sueño en Otro Idioma',
    'Beau Travail', 'Talented Mr Ripley', 'Portrait of a Lady on Fire',
    '20000 Species of Bees', 'Una Penicula de Policias',
    'Sick of Myself', 'Influencer', 'Will o the Wisp',
    'You Hurt My Feelings', 'Philadelphia', "I Love You Phillip Morris",
    'Dear Ex', 'Plan 75', 'Tick Tick Boom', 'RRR',
    'All Quiet on the Western Front', 'Swiss Army Man',
    'Three Idiots', 'Handmaiden', 'A Single Man',
    'Top Gun Maverick', 'Uncut Gems', 'Shelter',
    'Duke', 'Flee', 'Slow West',
    'Babel', 'Cha Cha Real Smooth',
    'Rear Windows', "Manco Cápac",
    "The Departures", "Mummy", "Matthias and Maxime",
    "Kite Runner"
  ];
}
