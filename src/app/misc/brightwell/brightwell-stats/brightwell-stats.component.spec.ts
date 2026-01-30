import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrightwellStatsComponent } from './brightwell-stats.component';

describe('BrightwellStatsComponent', () => {
  let component: BrightwellStatsComponent;
  let fixture: ComponentFixture<BrightwellStatsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrightwellStatsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrightwellStatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
