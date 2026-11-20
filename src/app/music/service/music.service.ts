import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map, switchMap} from 'rxjs/operators';
import {RatingHydrationService} from '../../utils/rating-bar/service/rating-hydration.service';
import {Album} from '../albums/album.interface';
import {Playlist} from '../playlists/playlist.interface';
import {NintendoPlaylist} from '../nintendo/playlists/nintendo-playlist.interface';
import {Soundtrack} from '../nintendo/soundtrack.interface';
import {CD} from '../cds/cd.interface';
import {Concert} from '../concerts/concert.interface';
import {Mix} from '../mixes/mix.interface';
import {DailySoundtrack} from '../daily/daily-soundtrack.interface';
import {KKSong} from '../nintendo/kk/kk-song.interface';

@Injectable({
  providedIn: 'root'
})
export class MusicService {
  constructor(
    private http: HttpClient,
    private ratingHydration: RatingHydrationService
  ) {}

  getAlbums(hydrateRatings: boolean = true): Observable<Album[]> {
    const data$ = this.http.get<{ albums: Album[] }>('assets/data/albums.json').pipe(
      map(res => res.albums || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getPlaylists(hydrateRatings: boolean = true): Observable<Playlist[]> {
    const data$ = this.http.get<{ playlists: Playlist[] }>('assets/data/playlists.json').pipe(
      map(res => res.playlists || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getNintendoPlaylists(hydrateRatings: boolean = true): Observable<NintendoPlaylist[]> {
    const data$ = this.http.get<{ playlists: NintendoPlaylist[] }>('assets/data/nintendo-playlists.json').pipe(
      map(res => res.playlists || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getSoundtracks(hydrateRatings: boolean = true): Observable<Soundtrack[]> {
    const data$ = this.http.get<{ soundtracks: Soundtrack[] }>('assets/data/soundtracks.json').pipe(
      map(res => res.soundtracks || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getCds(hydrateRatings: boolean = true): Observable<CD[]> {
    const data$ = this.http.get<{ cds: CD[] }>('assets/data/cds.json').pipe(
      map(res => res.cds || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getConcerts(hydrateRatings: boolean = true): Observable<Concert[]> {
    const data$ = this.http.get<{ concerts: Concert[] }>('assets/data/concerts.json').pipe(
      map(res => res.concerts || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getMixes(hydrateRatings: boolean = true): Observable<Mix[]> {
    const data$ = this.http.get<{ mixes: Mix[] }>('assets/data/mixes.json').pipe(
      map(res => res.mixes || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getDailySoundtracks(hydrateRatings: boolean = true): Observable<DailySoundtrack[]> {
    const data$ = this.http.get<{ dailies: DailySoundtrack[] }>('assets/data/dailies.json').pipe(
      map(res => res.dailies || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }

  getKkSongs(hydrateRatings: boolean = true): Observable<KKSong[]> {
    const data$ = this.http.get<{ kkSongs: KKSong[] }>('assets/data/kk.json').pipe(
      map(res => res.kkSongs || [])
    );
    return hydrateRatings ? data$.pipe(switchMap(items => this.ratingHydration.hydrateRatings(items))) : data$;
  }
}
