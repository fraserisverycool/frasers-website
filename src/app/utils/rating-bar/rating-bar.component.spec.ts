import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RatingBarComponent } from './rating-bar.component';

describe('RatingbarComponent', () => {
  let component: RatingBarComponent;
  let fixture: ComponentFixture<RatingBarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RatingBarComponent]
    });
    fixture = TestBed.createComponent(RatingBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
