import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StitchComponent } from './stitch.component';

describe('StitchComponent', () => {
  let component: StitchComponent;
  let fixture: ComponentFixture<StitchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StitchComponent]
    });
    fixture = TestBed.createComponent(StitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
