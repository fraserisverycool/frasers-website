import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurstloescherComponent } from './durstloescher.component';

describe('DurstloescherComponent', () => {
  let component: DurstloescherComponent;
  let fixture: ComponentFixture<DurstloescherComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DurstloescherComponent]
    });
    fixture = TestBed.createComponent(DurstloescherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
