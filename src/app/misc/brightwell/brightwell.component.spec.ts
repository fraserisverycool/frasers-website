import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrightwellComponent } from './brightwell.component';

describe('BrightwellComponent', () => {
  let component: BrightwellComponent;
  let fixture: ComponentFixture<BrightwellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrightwellComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrightwellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
