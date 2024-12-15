import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrexitComponent } from './brexit.component';

describe('BrexitComponent', () => {
  let component: BrexitComponent;
  let fixture: ComponentFixture<BrexitComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BrexitComponent]
    });
    fixture = TestBed.createComponent(BrexitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
