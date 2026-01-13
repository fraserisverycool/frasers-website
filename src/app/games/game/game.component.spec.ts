import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GameComponent } from './game.component';
import { Game } from '../game.interface';

describe('GameComponent', () => {
  let component: GameComponent;
  let fixture: ComponentFixture<GameComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameComponent]
    });
    fixture = TestBed.createComponent(GameComponent);
    component = fixture.componentInstance;

    // Provide a mock game input to avoid errors
    component.game = {
      id: '1',
      name: 'Test Game',
      platform: 'Switch',
      image: 'test.jpg',
      rating: [5],
      review: ['Good game'],
      year: '2024',
      vibes: 5,
      gameplay: 5,
      release: 2024,
      story: true,
      score: 10,
      completed: true,
      completable: true,
      newsletter: false
    } as Game;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
