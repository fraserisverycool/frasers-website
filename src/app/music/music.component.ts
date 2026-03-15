import { Component, OnInit } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {Album} from "./albums/album.interface";
import {Soundtrack} from "./nintendo/soundtrack.interface";
import {CD} from "./cds/cd.interface";
import { HttpClient } from "@angular/common/http";
import {DailyComponent} from "./daily/daily.component";
import {Concert} from "./concerts/concert.interface";
import {ImageService} from "../utils/services/image.service";

@Component({
    selector: 'app-music',
    imports: [RouterLink, NgOptimizedImage, DailyComponent],
    templateUrl: './music.component.html',
    styleUrls: ['./music.component.css']
})
export default class MusicComponent implements OnInit {
  albums: Album[] = [];
  soundtracks: Soundtrack[] = [];
  cds: CD[] = [];
  randomAlbum: Album | null = null;
  randomSoundtrack: Soundtrack | null = null;
  randomCd: CD | null = null;
  randomConcert: Concert | null = null;
  randomSmashImage: string | null = null;

  constructor(private http: HttpClient, private router: Router, protected imageService: ImageService) {}

  ngOnInit(): void {
    this.loadRandomAlbum();
    this.loadRandomSoundtrack();
    this.loadRandomCd();
    this.loadRandomConcert();
    this.loadRandomSmashImage();
  }

  handleClick(url: string) {
    this.router.navigate([url]);
  }

  loadRandomAlbum(): void {
    this.http.get<{ albums: Album[] }>('assets/data/albums.json').subscribe({
      next: (data) => {
      this.randomAlbum = data.albums[Math.floor(Math.random() * data.albums.length)];
      },
      error: (err) => {
        console.error('Failed to load albums:', err);
      },
    });
  }

  loadRandomSoundtrack(): void {
    this.http.get<{ soundtracks: Soundtrack[] }>('assets/data/soundtracks.json').subscribe({
      next: (data) => {
      this.randomSoundtrack = data.soundtracks[Math.floor(Math.random() * data.soundtracks.length)];
      },
      error: (err) => {
        console.error('Failed to load soundtracks:', err);
      },
    });
  }

  loadRandomCd(): void {
    this.http.get<{ cds: CD[] }>('assets/data/cds.json').subscribe({
      next: (data) => {
        this.randomCd = data.cds[Math.floor(Math.random() * data.cds.length)];
      },
      error: (err) => {
        console.error('Failed to load CDs:', err);
      },
    });
  }

  loadRandomConcert(): void {
    this.http.get<{ concerts: Concert[] }>('assets/data/concerts.json').subscribe({
      next: (data) => {
        const concerts = data.concerts.filter(concert => concert.artist !== '')
        this.randomConcert = concerts[Math.floor(Math.random() * concerts.length)];
      },
      error: (err) => {
        console.error('Failed to load concerts:', err);
      },
    });
  }

  loadRandomSmashImage(): void {
    const smashImages = [
      'alph_ssb4.png', 'alph_ssbu.png', 'banjo_ssbu.png', 'bayonetta_2_ssb4.png', 'bayonetta_2_ssbu.png',
      'bayonetta_ssb4.png', 'bayonetta_ssbu.png', 'bowser_jr_ssb4.png', 'bowser_jr_ssbu.png', 'bowser_ssb4.png',
      'bowser_ssbb.png', 'bowser_ssbm.png', 'bowser_ssbu.png', 'byleth_f_ssbu.png', 'byleth_ssbu.png',
      'captain_falcon_ssb.png', 'captain_falcon_ssb4.png', 'captain_falcon_ssbb.png', 'captain_falcon_ssbm.png',
      'captain_falcon_ssbu.png', 'charizard_ssb4.png', 'charizard_ssbb.png', 'charizard_ssbu.png', 'chrom_ssbu.png',
      'cloud_2_ssbu.png', 'cloud_ssb4.png', 'cloud_ssbu.png', 'corrin_f_ssb4.png', 'corrin_f_ssbu.png',
      'corrin_ssb4.png', 'corrin_ssbu.png', 'daisy_ssbu.png', 'dark_pit_ssb4.png', 'dark_pit_ssbu.png',
      'dark_samus_ssbu.png', 'diddy_kong_ssb4.png', 'diddy_kong_ssbb.png', 'diddy_kong_ssbu.png',
      'donkey_kong_ssb.png', 'donkey_kong_ssb4.png', 'donkey_kong_ssbb.png', 'donkey_kong_ssbm.png',
      'donkey_kong_ssbu.png', 'dr_mario_ssb4.png', 'dr_mario_ssbm.png', 'dr_mario_ssbu.png', 'duck_hunt_ssb4.png',
      'duck_hunt_ssbu.png', 'falco_ssb4.png', 'falco_ssbb.png', 'falco_ssbm.png', 'falco_ssbu.png', 'fox_ssb.png',
      'fox_ssb4.png', 'fox_ssbb.png', 'fox_ssbm.png', 'fox_ssbu.png', 'ganondorf_ssb4.png', 'ganondorf_ssbb.png',
      'ganondorf_ssbm.png', 'ganondorf_ssbu.png', 'gnw_ssb4.png', 'gnw_ssbb.png', 'gnw_ssbm.png', 'gnw_ssbu.png',
      'greninja_ssb4.png', 'greninja_ssbu.png', 'hero_2_ssbu.png', 'hero_3_ssbu.png', 'hero_4_ssbu.png',
      'hero_ssbu.png', 'ice_climbers_ssbb.png', 'ice_climbers_ssbm.png', 'ice_climbers_ssbu.png', 'ike_ssb4.png',
      'ike_ssbb.png', 'ike_ssbu.png', 'ike_top_ssbu.png', 'incineroar_ssbu.png', 'inkling_m_ssbu.png',
      'inkling_ssbu.png', 'isabelle_ssbu.png', 'ivysaur_ssbb.png', 'ivysaur_ssbu.png', 'jigglypuff_ssb.png',
      'jigglypuff_ssb4.png', 'jigglypuff_ssbb.png', 'jigglypuff_ssbm.png', 'jigglypuff_ssbu.png', 'joker_1_ssbu.png',
      'joker_3_ssbu.png', 'joker_4_ssbu.png', 'joker_a_ssbu.png', 'joker_ssbu.png', 'kazuya_ssbu.png', 'ken_ssbu.png',
      'king_dedede_ssb4.png', 'king_dedede_ssbb.png', 'king_dedede_ssbu.png', 'king_k_rool_ssbu.png', 'kirby_ssb.png',
      'kirby_ssb4.png', 'kirby_ssbb.png', 'kirby_ssbm.png', 'kirby_ssbu.png', 'link_ssb.png', 'link_ssb4.png',
      'link_ssbb.png', 'link_ssbm.png', 'link_ssbu.png', 'little_mac_ssb4.png', 'little_mac_ssbu.png',
      'lucario_ssb4.png', 'lucario_ssbb.png', 'lucario_ssbu.png', 'lucas_ssb4.png', 'lucas_ssbb.png', 'lucas_ssbu.png',
      'lucina_ssb4.png', 'lucina_ssbu.png', 'luigi_ssb.png', 'luigi_ssb4.png', 'luigi_ssbb.png', 'luigi_ssbm.png',
      'luigi_ssbu.png', 'mario_m_ssbu.png', 'mario_o_ssbu.png', 'mario_ssb.png', 'mario_ssb4.png', 'mario_ssbb.png',
      'mario_ssbm.png', 'mario_ssbu.png', 'marth_ssb4.png', 'marth_ssbb.png', 'marth_ssbm.png', 'marth_ssbu.png',
      'mega_man_ssb4.png', 'mega_man_ssbu.png', 'meta_knight_ssb4.png', 'meta_knight_ssbb.png', 'meta_knight_ssbu.png',
      'mewtwo_ssb4.png', 'mewtwo_ssbm.png', 'mewtwo_ssbu.png', 'mii_brawler_ssb4.png', 'mii_brawler_ssbu.png',
      'mii_gunner_ssb4.png', 'mii_gunner_ssbu.png', 'mii_swordfighter_ssb4.png', 'mii_swordfighter_ssbu.png',
      'minmin_ssbu.png', 'mythra_ssbu.png', 'ness_ssb.png', 'ness_ssb4.png', 'ness_ssbb.png', 'ness_ssbm.png',
      'ness_ssbu.png', 'olimar_ssb4.png', 'olimar_ssbb.png', 'olimar_ssbu.png', 'pacman_ssb4.png', 'pacman_ssbu.png',
      'palutena_ssb4.png', 'palutena_ssbu.png', 'peach_ssb4.png', 'peach_ssbb.png', 'peach_ssbm.png', 'peach_ssbu.png',
      'pichu_ssbm.png', 'pichu_ssbu.png', 'pikachu_ssb.png', 'pikachu_ssb4.png', 'pikachu_ssbb.png', 'pikachu_ssbm.png',
      'pikachu_ssbu.png', 'piranha_plant_ssbu.png', 'pit_ssb4.png', 'pit_ssbb.png', 'pit_ssbu.png',
      'pokemon_trainer_f_ssbu.png', 'pokemon_trainer_ssbb.png', 'pokemon_trainer_ssbu.png', 'pyra_ssbu.png',
      'richter_ssbu.png', 'ridley_m_ssbu.png', 'ridley_ssbu.png', 'robin_f_ssb4.png', 'robin_f_ssbu.png',
      'robin_ssb4.png', 'robin_ssbu.png', 'rob_ssb4.png', 'rob_ssbb.png', 'rob_ssbu.png', 'rosalina_ssb4.png',
      'rosalina_ssbu.png', 'roy_ssb4.png', 'roy_ssbm.png', 'roy_ssbu.png', 'ryu_ssb4.png', 'ryu_ssbu.png',
      'samus_ssb.png', 'samus_ssb4.png', 'samus_ssbb.png', 'samus_ssbm.png', 'samus_ssbu.png', 'sephiroth_ssbu.png',
      'sheik_ssb4.png', 'sheik_ssbb.png', 'sheik_ssbm.png', 'sheik_ssbu.png', 'shulk_ssb4.png', 'shulk_ssbu.png',
      'simon_ssbu.png', 'smash_3ds_ssb4.png', 'smash_ssb.png', 'smash_ssbb.png', 'smash_ssbm.png', 'smash_ssbu.png',
      'smash_s_ssbb.png', 'smash_wiiu_ssb4.png', 'smash_wol_ssbu.png', 'snake_ssbb.png', 'snake_ssbu.png',
      'sonic_ssb4.png', 'sonic_ssbb.png', 'sonic_ssbu.png', 'sora_ssbu.png', 'squirtle_ssbb.png', 'squirtle_ssbu.png',
      'steve_f_ssbu.png', 'steve_ssbu.png', 'terry_ssbu.png', 'toon_link_ssb4.png', 'toon_link_ssbb.png',
      'toon_link_ssbu.png', 'villager_f_ssb4.png', 'villager_f_ssbu.png', 'villager_ssb4.png', 'villager_ssbu.png',
      'wario_l_ssb4.png', 'wario_l_ssbu.png', 'wario_ssb4.png', 'wario_ssbb.png', 'wario_ssbu.png',
      'wii_fit_trainer_m_ssb4.png', 'wii_fit_trainer_m_ssbu.png', 'wii_fit_trainer_ssb4.png',
      'wii_fit_trainer_ssbu.png', 'wolf_ssbb.png', 'wolf_ssbu.png', 'yoshi_ssb.png', 'yoshi_ssb4.png',
      'yoshi_ssbb.png', 'yoshi_ssbm.png', 'yoshi_ssbu.png', 'young_link_ssbm.png', 'young_link_ssbu.png',
      'zelda_ssb4.png', 'zelda_ssbb.png', 'zelda_ssbm.png', 'zelda_ssbu.png', 'zss_ssb4.png', 'zss_ssbb.png',
      'zss_ssbu.png'
    ];
    this.randomSmashImage = smashImages[Math.floor(Math.random() * smashImages.length)];
  }
}
