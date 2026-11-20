import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import PhotoComponent from './photo.component';
import { PhotoService } from './service/photo.service';
import { Photo } from '../photo.interface';

describe('PhotoComponent', () => {
  let component: PhotoComponent;
  let fixture: ComponentFixture<PhotoComponent>;
  let serviceSpy: jasmine.SpyObj<PhotoService>;

  const photo: Photo = {
    filename: 'masked.jpg', unmasked: undefined, title: 'A photo', description: '', month: 'May',
    question: 'Who?', answer: [], id: 'p1', rating: [0, 0, 0, 0, 0, 0], newsletter: false
  };

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('PhotoService', ['postAnswer']);
    TestBed.configureTestingModule({
      imports: [PhotoComponent],
      providers: [{ provide: PhotoService, useValue: serviceSpy }]
    });
    fixture = TestBed.createComponent(PhotoComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('reveals the anecdote and unmasked image after a correct answer, without mutating the input', async () => {
    serviceSpy.postAnswer.and.returnValue(of({ id: 'p1', answers: '', anecdote: 'The story', unmasked: 'unmasked.jpg' }));
    component.userAnswer.set('me');

    component.checkAnswer();
    await fixture.whenStable();

    expect(serviceSpy.postAnswer).toHaveBeenCalledWith('p1', 'me');
    expect(component.showText()).toBeTrue();
    expect(component.description()).toBe('The story');
    expect(component.displayedFilename()).toBe('unmasked.jpg');
    expect(fixture.nativeElement.textContent).toContain('The story');
    expect(photo.description).toBe('');
  });

  it('keeps the photo masked after a wrong answer', async () => {
    spyOn(window, 'alert');
    serviceSpy.postAnswer.and.returnValue(throwError(() => new Error('wrong')));

    component.checkAnswer();
    await fixture.whenStable();

    expect(window.alert).toHaveBeenCalled();
    expect(component.showText()).toBeFalse();
    expect(component.displayedFilename()).toBe('masked.jpg');
  });
});
