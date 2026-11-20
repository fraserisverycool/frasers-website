import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import FilmsComponent from './films.component';
import { FilmService } from './service/film.service';

describe('FilmsComponent', () => {
  let component: FilmsComponent;
  let fixture: ComponentFixture<FilmsComponent>;
  let filmServiceSpy: jasmine.SpyObj<FilmService>;

  beforeEach(() => {
    filmServiceSpy = jasmine.createSpyObj('FilmService', ['getFilms']);
    filmServiceSpy.getFilms.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [FilmsComponent],
      providers: [
        { provide: FilmService, useValue: filmServiceSpy }
      ]
    });
    fixture = TestBed.createComponent(FilmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
