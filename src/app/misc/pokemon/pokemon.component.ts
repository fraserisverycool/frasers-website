import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HttpClient} from "@angular/common/http";
import {Pokemon, TierData} from "./pokemon.interface";
import {CloseButtonComponent} from "../../utils/close-button/close-button.component";
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

  originalTiers: TierData = {};
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
  currentFilter: number = 0;
  collapsed: { [tier: string]: boolean } = {};
  selectedPokemon: Pokemon | null = null;

  constructor(private http: HttpClient, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.http.get<TierData>('assets/data/pokemon.json')
      .subscribe(data => {
        this.originalTiers = data;
        this.tiers = this.originalTiers;

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

  private generationRange(gen: number): { min: number; max: number } {
    const ranges: Record<number, { min: number; max: number }> = {
      1: { min: 1, max: 151 },
      2: { min: 152, max: 251 },
      3: { min: 252, max: 386 },
      4: { min: 387, max: 493 },
      5: { min: 494, max: 649 },
      6: { min: 650, max: 721 },
      7: { min: 722, max: 809 },
      8: { min: 810, max: 905 },
      9: { min: 906, max: 1025 }
    };

    return ranges[gen] ?? { min: 1, max: Infinity };
  }

  getFilteredTiers(): TierData {
    if (!this.currentFilter) {
      return this.tiers;
    }

    const { min, max } = this.generationRange(this.currentFilter);
    const filtered: TierData = {};

    for (const tier of Object.keys(this.tiers)) {
      filtered[tier] = this.tiers[tier].filter(pokemon => {
        const num = Number(pokemon.number);
        return num >= min && num <= max;
      });
    }

    return filtered;
  }

  filterPokemon(criteria: number): void {
    this.currentFilter = criteria;
    this.tiers = this.originalTiers;
    if (criteria != 0) {
      this.tiers = this.getFilteredTiers();
    }
  }
}
