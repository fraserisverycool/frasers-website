import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingbarComponent } from './rating-bar.component';

describe('RatingbarComponent', () => {
  let component: RatingbarComponent;
  let fixture: ComponentFixture<RatingBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RatingbarComponent]
    });
    fixture = TestBed.createComponent(RatingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
