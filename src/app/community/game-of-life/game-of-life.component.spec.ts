import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameOfLifeComponent } from './game-of-life.component';

describe('GameOfLifeComponent', () => {
  let component: GameOfLifeComponent;
  let fixture: ComponentFixture<GameOfLifeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [GameOfLifeComponent]
    });
    fixture = TestBed.createComponent(GameOfLifeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
