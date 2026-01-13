import { ComponentFixture, TestBed } from '@angular/core/testing';

import NextFilmComponent from './next-film.component';

describe('NextFilmComponent', () => {
  let component: NextFilmComponent;
  let fixture: ComponentFixture<NextFilmComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NextFilmComponent]
    });
    fixture = TestBed.createComponent(NextFilmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
