import { ComponentFixture, TestBed } from '@angular/core/testing';

import DailiesComponent from './dailies.component';

describe('DailiesComponent', () => {
  let component: DailiesComponent;
  let fixture: ComponentFixture<DailiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [DailiesComponent]
    });
    fixture = TestBed.createComponent(DailiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
