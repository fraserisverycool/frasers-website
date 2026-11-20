import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingBarComponent } from './rating-bar.component';
import { RatingService } from './service/rating.service';

describe('RatingBarComponent', () => {
  let component: RatingBarComponent;
  let fixture: ComponentFixture<RatingBarComponent>;
  let ratingServiceSpy: jasmine.SpyObj<RatingService>;

  beforeEach(async () => {
    ratingServiceSpy = jasmine.createSpyObj('RatingService', ['updateRating']);
    TestBed.configureTestingModule({
      imports: [RatingBarComponent],
      providers: [{ provide: RatingService, useValue: ratingServiceSpy }]
    });
    fixture = TestBed.createComponent(RatingBarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('increments the clicked reaction, re-renders and saves, without mutating the input', async () => {
    const input = { id: 'x', ratings: [1, 2, 3, 4, 5, 6] };
    fixture.componentRef.setInput('rating', input);
    await fixture.whenStable();

    fixture.nativeElement.querySelectorAll('button')[2].click();
    await fixture.whenStable();

    expect(component.counts()).toEqual([1, 2, 4, 4, 5, 6]);
    expect(fixture.nativeElement.querySelectorAll('.count')[2].textContent.trim()).toBe('4');
    expect(ratingServiceSpy.updateRating).toHaveBeenCalledWith({ id: 'x', ratings: [1, 2, 4, 4, 5, 6] });
    expect(input.ratings).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('caps a reaction at 999', () => {
    fixture.componentRef.setInput('rating', { id: 'x', ratings: [999, 0, 0, 0, 0, 0] });
    component.onSelect(0);
    expect(component.counts()[0]).toBe(999);
  });
});
