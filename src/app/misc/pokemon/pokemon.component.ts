import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { CommonModule } from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {Pokemon, TierData} from "./pokemon.interface";
import {CloseButtonComponent} from "../../utils/close-button/close-button.component";
import { environment } from '../../../environments/environment';
import {ImageService} from "../../utils/services/image.service";

@Component({
  selector: 'app-pokemon',
  standalone: true,
  imports: [CommonModule, CloseButtonComponent],
  templateUrl: './pokemon.component.html',
  styleUrls: ['./pokemon.component.css']
})
export default class PokemonComponent  implements OnInit {
  @Output() close: EventEmitter<void> = new EventEmitter<void>();

  tiers: TierData = {};
  tierHeadings: any = {
    SS: "Best of the best",
    S: "Stunning, beautiful",
    A: "Love it",
    B: "Actually a great Pokémon",
    C: "It's alright, she's fine",
    D: "Doesn't speak to me",
    E: "Actively dislike this",
    F: "Hate it, ugly"
  };
  orderedTiers: string[] = ["SS", "S", "A", "B", "C", "D", "E", "F"];

  collapsed: { [tier: string]: boolean } = {};
  selectedPokemon: Pokemon | null = null;

  constructor(private http: HttpClient, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.http.get<TierData>('assets/data/pokemon.json')
      .subscribe(data => {
        this.tiers = data;

        for (let t of Object.keys(data)) {
          this.collapsed[t] = true;
        }
      });
  }

  toggleTier(tier: string) {
    this.collapsed[tier] = !this.collapsed[tier];
  }

  openModal(pokemon: Pokemon) {
    this.selectedPokemon = pokemon;
  }

  closeModal() {
    this.selectedPokemon = null;
  }
}
