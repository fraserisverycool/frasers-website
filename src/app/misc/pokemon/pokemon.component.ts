import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {CommonModule} from '@angular/common';
import { HttpClient } from "@angular/common/http";
import {Pokemon, TierData} from "./pokemon.interface";
import {CloseButtonComponent} from "../../utils/close-button/close-button.component";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-pokemon',
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
  activeGenerations = new Set<number>();
  activeRegions = new Set<string>();
  activeTypes = new Set<string>();
  collapsed: { [tier: string]: boolean } = {};
  selectedPokemon: Pokemon | null = null;
  filterMode: 'OR' | 'AND' = 'OR';

  pokemonTypes = [
    'normal',
    'fire',
    'water',
    'electric',
    'grass',
    'ice',
    'fighting',
    'poison',
    'ground',
    'flying',
    'psychic',
    'bug',
    'rock',
    'ghost',
    'dragon',
    'dark',
    'steel',
    'fairy'
  ];

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

  collapseAllTiers(): void {
    for (const tierKey of this.orderedTiers) {
      this.collapsed[tierKey] = true;
    }
  }

  expandAllTiers(): void {
    for (const tierKey of this.orderedTiers) {
      this.collapsed[tierKey] = false;
    }
  }

  openModal(pokemon: Pokemon) {
    this.selectedPokemon = pokemon;
  }

  closeModal() {
    this.selectedPokemon = null;
  }

  private regionFilters: Record<string, { keyword: string; extras: string[] }> = {
    alolan: {
      keyword: 'alolan',
      extras: []
    },
    galarian: {
      keyword: 'galarian',
      extras: [
        'Perrserker',
        "Sirfetch'd",
        'Mr. Rime',
        'Cursola',
        'Obstagoon',
        'Runerigus'
      ]
    },
    hisuian: {
      keyword: 'hisuian',
      extras: ['Overqwil', 'Sneasler']
    },
    paldean: {
      keyword: 'paldean',
      extras: ['Clodsire']
    }
  };

  private filterByRegion(regionKey: string): TierData {
    const config = this.regionFilters[regionKey];
    const filtered: TierData = {};

    for (const tier of Object.keys(this.tiers)) {
      filtered[tier] = this.tiers[tier].filter(pokemon => {
        const name = pokemon.name.toLowerCase();

        const matchesKeyword = name.includes(config.keyword);
        const matchesExtra = config.extras.some(extra =>
          pokemon.name.startsWith(extra)
        );

        return matchesKeyword || matchesExtra;
      });
    }

    return filtered;
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

  private regionGenerationOverride(name: string): number | null {
    const lower = name.toLowerCase();

    if (lower.includes('alolan')) return 7;
    if (lower.includes('galarian') || lower.includes('hisuian')) return 8;
    if (lower.includes('paldean')) return 9;

    return null;
  }

  private getPokemonGeneration(pokemon: Pokemon): number {
    const regionOverride = this.regionGenerationOverride(pokemon.name);
    if (regionOverride) {
      return regionOverride;
    }

    const num = Number(pokemon.number);

    for (let gen = 1; gen <= 9; gen++) {
      const { min, max } = this.generationRange(gen);
      if (num >= min && num <= max) {
        return gen;
      }
    }

    return 1;
  }

  private matchesGeneration(pokemon: Pokemon): boolean {
    if (this.activeGenerations.size === 0) return false;

    const gen = this.getPokemonGeneration(pokemon);

    if (this.filterMode === 'AND') {
      // Must match all selected generations? Usually only one selected makes sense
      return this.activeGenerations.has(gen);
    }

    // OR mode
    return this.activeGenerations.has(gen);
  }

  private matchesRegion(pokemon: Pokemon): boolean {
    if (this.activeRegions.size === 0) return false;

    const name = pokemon.name.toLowerCase();

    if (this.filterMode === 'AND') {
      // Every active region must match this Pokémon
      return Array.from(this.activeRegions).every(region => {
        const config = this.regionFilters[region];
        const keywordMatch = name.includes(config.keyword);
        const extraMatch = config.extras.some(extra =>
          pokemon.name.startsWith(extra)
        );
        return keywordMatch || extraMatch;
      });
    }

    // OR mode
    return Array.from(this.activeRegions).some(region => {
      const config = this.regionFilters[region];
      const keywordMatch = name.includes(config.keyword);
      const extraMatch = config.extras.some(extra =>
        pokemon.name.startsWith(extra)
      );
      return keywordMatch || extraMatch;
    });
  }

  private matchesType(pokemon: Pokemon): boolean {
    if (this.activeTypes.size === 0) {
      return false;
    }

    if (!pokemon.types || pokemon.types.length === 0) {
      return false;
    }

    const pokemonTypes = pokemon.types.map(t => t.toLowerCase());

    if (this.filterMode === 'AND') {
      // All selected types must exist in this Pokémon
      return Array.from(this.activeTypes).every(type =>
        pokemonTypes.includes(type)
      );
    }

    // OR mode: at least one type matches
    return pokemonTypes.some(type =>
      this.activeTypes.has(type)
    );
  }

  private applyFilters(): void {
    const hasAnyFilters =
      this.activeGenerations.size > 0 ||
      this.activeRegions.size > 0 ||
      this.activeTypes.size > 0;

    if (!hasAnyFilters) {
      this.tiers = this.originalTiers;
      return;
    }

    const filtered: TierData = {};

    for (const tier of Object.keys(this.originalTiers)) {
      filtered[tier] = this.originalTiers[tier].filter(pokemon => {
        const genMatch = this.matchesGeneration(pokemon);
        const regionMatch = this.matchesRegion(pokemon);
        const typeMatch = this.matchesType(pokemon);

        if (this.filterMode === 'OR') {
          return genMatch || regionMatch || typeMatch;
        }

        // AND mode: must satisfy all categories with active filters
        return (
          (this.activeGenerations.size === 0 || genMatch) &&
          (this.activeRegions.size === 0 || regionMatch) &&
          (this.activeTypes.size === 0 || typeMatch)
        );
      });
    }

    this.tiers = filtered;
  }

  toggleGeneration(gen: number): void {
    if (this.activeGenerations.has(gen)) {
      this.activeGenerations.delete(gen);
    } else {
      this.activeGenerations.add(gen);
    }

    this.applyFilters();
  }

  toggleRegion(region: string): void {
    if (this.activeRegions.has(region)) {
      this.activeRegions.delete(region);
    } else {
      this.activeRegions.add(region);
    }

    this.applyFilters();
  }

  toggleType(type: string): void {
    if (this.activeTypes.has(type)) {
      this.activeTypes.delete(type);
    } else {
      this.activeTypes.add(type);
    }

    this.applyFilters();
  }

  clearFilters(): void {
    this.activeGenerations.clear();
    this.activeRegions.clear();
    this.activeTypes.clear();
    this.tiers = this.originalTiers;
  }

  toggleFilterMode(): void {
    this.filterMode = this.filterMode === 'OR' ? 'AND' : 'OR';
    this.applyFilters();
  }
}
