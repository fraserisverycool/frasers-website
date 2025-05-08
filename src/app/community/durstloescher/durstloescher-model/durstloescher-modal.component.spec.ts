import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DurstloescherModalComponent } from './durstloescher-modal.component';

describe('DurstloescherModalComponent', () => {
  let component: DurstloescherModalComponent;
  let fixture: ComponentFixture<DurstloescherModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DurstloescherModalComponent]
    });
    fixture = TestBed.createComponent(DurstloescherModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
