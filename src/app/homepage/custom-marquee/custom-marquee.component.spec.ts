import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMarqueeComponent } from './custom-marquee.component';

describe('CustomMarqueeComponent', () => {
  let component: CustomMarqueeComponent;
  let fixture: ComponentFixture<CustomMarqueeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CustomMarqueeComponent]
    });
    fixture = TestBed.createComponent(CustomMarqueeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
