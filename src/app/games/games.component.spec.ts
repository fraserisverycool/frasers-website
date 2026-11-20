import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import GamesComponent from './games.component';
import { GameService } from './service/game.service';

describe('GamesComponent', () => {
  let component: GamesComponent;
  let fixture: ComponentFixture<GamesComponent>;
  let gameServiceSpy: jasmine.SpyObj<GameService>;

  beforeEach(() => {
    gameServiceSpy = jasmine.createSpyObj('GameService', ['getGames']);
    gameServiceSpy.getGames.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [GamesComponent],
      providers: [
        { provide: GameService, useValue: gameServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(GamesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
