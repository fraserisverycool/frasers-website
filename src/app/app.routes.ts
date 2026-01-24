import { Routes } from '@angular/router';
import HomepageComponent from "./homepage/homepage.component";
import PartyComponent from "./homepage/party/party.component";
import ChangelogPageComponent from "./homepage/changelog-page/changelog-page.component";
import GamesComponent from "./games/games.component";
import NextFilmComponent from "./films/next/next-film.component";
import FilmsComponent from "./films/films.component";
import NextGameComponent from "./games/next/next-game.component";
import MusicComponent from "./music/music.component";
import AlbumsComponent from "./music/albums/albums.component";
import SpotifyComponent from "./music/spotify/spotify.component";
import SoundtracksComponent from "./music/nintendo/soundtracks.component";
import KkComponent from "./music/nintendo/kk/kk.component";
import MixesComponent from "./music/mixes/mixes.component";
import CdsComponent from "./music/cds/cds.component";
import DailiesComponent from "./music/daily/dailies/dailies.component";
import WorldpeaceComponent from "./music/worldpeace/worldpeace.component";
import BooksComponent from "./books/books.component";
import PhotosComponent from "./gallery/photos.component";
import VideosComponent from "./gallery/videos/videos.component";
import CommunityComponent from "./community/community.component";
import DurstloescherComponent from "./community/durstloescher/durstloescher.component";
import GameOfLifeComponent from "./community/game-of-life/game-of-life.component";
import MiscComponent from "./misc/misc.component";
import BrexitComponent from "./misc/brexit/brexit.component";
import CharactersComponent from "./misc/characters/characters.component";
import MariokartComponent from "./misc/mariokart/mariokart.component";
import StitchComponent from "./misc/stitch/stitch.component";
import WritingComponent from "./misc/writing/writing.component";
import GuestbookComponent from "./guestbook/guestbook.component";
import NewslettersComponent from "./newsletter/newsletters.component";
import NewsletterComponent from "./newsletter/newsletter/newsletter.component";
import ConcertsComponent from "./music/concerts/concerts.component";
import PokemonComponent from "./misc/pokemon/pokemon.component";
import ContactComponent from "./contact/contact.component";

export const routes: Routes = [
  {
    path: '', component: HomepageComponent, data: { title: 'Fraser\'s Website' }
  },
  {
    path: 'party', component: PartyComponent, data: { title: 'Party - Fraser\'s Website' }
  },
  {
    path: 'changelog', component: ChangelogPageComponent, data: { title: 'Changelog - Fraser\'s Website' }
  },
  {
    path: 'games', component: GamesComponent, data: { title: 'Games - Fraser\'s Website' }
  },
  {
    path: 'games/next', component: NextGameComponent, data: { title: 'Games To Play - Fraser\'s Website\'' }
  },
  {
    path: 'films', component: FilmsComponent, data: { title: 'Films - Fraser\'s Website'}
  },
  {
    path: 'films/next', component: NextFilmComponent, data: { title: 'Films To Watch - Fraser\'s Website\'' }
  },
  {
    path: 'music', component: MusicComponent, data: { title: 'Music - Fraser\'s Website' }
  },
  {
    path: 'music/albums', component: AlbumsComponent, data: { title: 'Albums - Fraser\'s Website' }
  },
  {
    path: 'music/spotify', component: SpotifyComponent, data: { title: 'Spotify Playlists - Fraser\'s Website' }
  },
  {
    path: 'music/nintendo', component: SoundtracksComponent, data: { title: 'Nintendo Soundtracks - Fraser\'s Website' }
  },
  {
    path: 'music/nintendo/kk', component: KkComponent, data: { title: 'KK Songs - Fraser\'s Website' }
  },
  {
    path: 'music/concerts', component: ConcertsComponent, data: { title: 'Concerts - Fraser\'s Website' }
  },
  {
    path: 'music/mixes', component: MixesComponent, data: { title: 'Video Game Mixes - Fraser\'s Website' }
  },
  {
    path: 'music/cds', component: CdsComponent, data: { title: 'CDs - Fraser\'s Website' }
  },
  {
    path: 'music/daily-soundtracks', component: DailiesComponent, data: { title: 'Daily Soundtracks - Fraser\'s Website' }
  },
  {
    path: 'music/worldpeace', component: WorldpeaceComponent, data: { title: 'DJ World Peace - Fraser\'s Website' }
  },
  {
    path: 'books', component: BooksComponent, data: { title: 'Books - Fraser\'s Website' }
  },
  {
    path: 'gallery', component: PhotosComponent, data: { title: 'Music - Fraser\'s Website' }
  },
  {
    path: 'gallery/videos', component: VideosComponent, data: { title: 'Videos - Fraser\'s Website' }
  },
  {
    path: 'community', component: CommunityComponent, data: { title: 'Community - Fraser\'s Website' }
  },
  {
    path: 'community/durstloescher', component: DurstloescherComponent, data: { title: 'Durstlöscher - Fraser\'s Website' }
  },
  {
    path: 'community/game-of-life', component: GameOfLifeComponent, data: { title: 'Game of Life - Fraser\'s Website' }
  },
  {
    path: 'misc', component: MiscComponent, data: { title: 'Miscellaneous - Fraser\'s Website' }
  },
  {
    path: 'misc/brexitsummit', component: BrexitComponent, data: { title: 'BREXIT SUMMIT - Fraser\'s Website' }
  },
  {
    path: 'misc/characters', component: CharactersComponent, data: { title: 'Smash Characters - Fraser\'s Website' }
  },
  {
    path: 'misc/mariokart', component: MariokartComponent, data: { title: 'Music - Fraser\'s Website' }
  },
  {
    path: 'misc/stitch', component: StitchComponent, data: { title: 'Cross Stitches - Fraser\'s Website' }
  },
  {
    path: 'misc/writing', component: WritingComponent, data: { title: 'Old Posts - Fraser\'s Website' }
  },
  {
    path: 'misc/pokemon', component: PokemonComponent, data: { title: 'Pokemon Ranking - Fraser\'s Website' }
  },
  {
    path: 'guestbook', component: GuestbookComponent, data: { title: 'Guestbook - Fraser\'s Website' }
  },
  {
    path: 'newsletter', component: NewslettersComponent, data: { title: 'Newsletters - Fraser\'s Website' }
  },
  {
    path: 'newsletter/:timestamp', component: NewsletterComponent, data: { title: 'Newsletter - Fraser\'s Website' }
  },
  {
    path: 'contact', component: ContactComponent, data: { title: 'Contact - Fraser\'s Website' }
  },
];
