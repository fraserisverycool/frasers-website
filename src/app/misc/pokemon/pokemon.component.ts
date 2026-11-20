import { Component, computed, inject, output, signal } from '@angular/core';
import { NgClass, TitleCasePipe } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {Pokemon, TierData} from "./pokemon.interface";
import {CloseButtonComponent} from "../../utils/close-button/close-button.component";
import {ImageUrlPipe} from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-pokemon',
    imports: [NgClass, TitleCasePipe, CloseButtonComponent, ImageUrlPipe],
    templateUrl: './pokemon.component.html',
    styleUrls: ['./pokemon.component.css'],
    host: { '(window:popstate)': 'onPopState()' }
})
export default class PokemonComponent {
  private http = inject(HttpClient);

  readonly close = output<void>();

  readonly originalTiers = signal<TierData>({});
  readonly tierHeadings: any = {
    SS: "Best of the best",
    S: "Stunning, beautiful",
    A: "Love it",
    B: "Actually a great Pokémon",
    C: "It's alright, she's fine",
    D: "Doesn't speak to me",
    E: "Actively dislike this",
    F: "Hate it, ugly"
  };
  readonly orderedTiers: string[] = ["SS", "S", "A", "B", "C", "D", "E", "F"];
  readonly activeGenerations = signal<ReadonlySet<number>>(new Set());
  readonly activeRegions = signal<ReadonlySet<string>>(new Set());
  readonly activeTypes = signal<ReadonlySet<string>>(new Set());
  readonly collapsed = signal<{ [tier: string]: boolean }>({});
  readonly selectedPokemon = signal<Pokemon | null>(null);
  readonly filterMode = signal<'OR' | 'AND'>('OR');

  /** The tiers after applying the active generation/region/type filters. */
  readonly tiers = computed(() => this.applyFilters());

  readonly pokemonTypes = [
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

  constructor() {
    this.http.get<TierData>('assets/data/pokemon.json')
      .pipe(takeUntilDestroyed())
      .subscribe({
        next: data => {
          this.originalTiers.set(data);
          const collapsed = { ...this.collapsed() };
          for (const t of Object.keys(data)) {
            collapsed[t] = true;
          }
          this.collapsed.set(collapsed);
        },
        error: err => console.error('Failed to load pokemon:', err),
      });
  }

  onPopState() {
    if (this.selectedPokemon()) {
      this.closeModal();
    }
  }

  toggleTier(tier: string) {
    this.collapsed.update(collapsed => ({ ...collapsed, [tier]: !collapsed[tier] }));
  }

  collapseAllTiers(): void {
    this.setAllTiersCollapsed(true);
  }

  expandAllTiers(): void {
    this.setAllTiersCollapsed(false);
  }

  private setAllTiersCollapsed(value: boolean): void {
    this.collapsed.update(collapsed => {
      const next = { ...collapsed };
      for (const tierKey of this.orderedTiers) {
        next[tierKey] = value;
      }
      return next;
    });
  }

  openModal(pokemon: Pokemon) {
    this.selectedPokemon.set(pokemon);
    history.pushState({ modal: true }, '');
  }

  closeModal() {
    this.selectedPokemon.set(null);
    if (window.history.state?.modal) {
      history.back();
    }
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
    const tiers = this.tiers();

    for (const tier of Object.keys(tiers)) {
      filtered[tier] = tiers[tier].filter(pokemon => {
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
    if (this.activeGenerations().size === 0) return false;

    const gen = this.getPokemonGeneration(pokemon);

    if (this.filterMode() === 'AND') {
      // Must match all selected generations? Usually only one selected makes sense
      return this.activeGenerations().has(gen);
    }

    // OR mode
    return this.activeGenerations().has(gen);
  }

  private matchesRegion(pokemon: Pokemon): boolean {
    if (this.activeRegions().size === 0) return false;

    const name = pokemon.name.toLowerCase();

    if (this.filterMode() === 'AND') {
      // Every active region must match this Pokémon
      return Array.from(this.activeRegions()).every(region => {
        const config = this.regionFilters[region];
        const keywordMatch = name.includes(config.keyword);
        const extraMatch = config.extras.some(extra =>
          pokemon.name.startsWith(extra)
        );
        return keywordMatch || extraMatch;
      });
    }

    // OR mode
    return Array.from(this.activeRegions()).some(region => {
      const config = this.regionFilters[region];
      const keywordMatch = name.includes(config.keyword);
      const extraMatch = config.extras.some(extra =>
        pokemon.name.startsWith(extra)
      );
      return keywordMatch || extraMatch;
    });
  }

  private matchesType(pokemon: Pokemon): boolean {
    if (this.activeTypes().size === 0) {
      return false;
    }

    if (!pokemon.types || pokemon.types.length === 0) {
      return false;
    }

    const pokemonTypes = pokemon.types.map(t => t.toLowerCase());

    if (this.filterMode() === 'AND') {
      // All selected types must exist in this Pokémon
      return Array.from(this.activeTypes()).every(type =>
        pokemonTypes.includes(type)
      );
    }

    // OR mode: at least one type matches
    return pokemonTypes.some(type =>
      this.activeTypes().has(type)
    );
  }

  private applyFilters(): TierData {
    const originalTiers = this.originalTiers();
    const hasAnyFilters =
      this.activeGenerations().size > 0 ||
      this.activeRegions().size > 0 ||
      this.activeTypes().size > 0;

    if (!hasAnyFilters) {
      return originalTiers;
    }

    const filtered: TierData = {};

    for (const tier of Object.keys(originalTiers)) {
      filtered[tier] = originalTiers[tier].filter(pokemon => {
        const genMatch = this.matchesGeneration(pokemon);
        const regionMatch = this.matchesRegion(pokemon);
        const typeMatch = this.matchesType(pokemon);

        if (this.filterMode() === 'OR') {
          return genMatch || regionMatch || typeMatch;
        }

        // AND mode: must satisfy all categories with active filters
        return (
          (this.activeGenerations().size === 0 || genMatch) &&
          (this.activeRegions().size === 0 || regionMatch) &&
          (this.activeTypes().size === 0 || typeMatch)
        );
      });
    }

    return filtered;
  }

  toggleGeneration(gen: number): void {
    this.activeGenerations.update(set => PokemonComponent.toggled(set, gen));
  }

  toggleRegion(region: string): void {
    this.activeRegions.update(set => PokemonComponent.toggled(set, region));
  }

  toggleType(type: string): void {
    this.activeTypes.update(set => PokemonComponent.toggled(set, type));
  }

  clearFilters(): void {
    this.activeGenerations.set(new Set());
    this.activeRegions.set(new Set());
    this.activeTypes.set(new Set());
  }

  toggleFilterMode(): void {
    this.filterMode.update(mode => (mode === 'OR' ? 'AND' : 'OR'));
  }

  private static toggled<T>(set: ReadonlySet<T>, value: T): ReadonlySet<T> {
    const next = new Set(set);
    if (next.has(value)) {
      next.delete(value);
    } else {
      next.add(value);
    }
    return next;
  }
}
