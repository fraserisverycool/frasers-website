import { ComponentFixture, TestBed } from '@angular/core/testing';

import MariokartComponent from './mariokart.component';

describe('MariokartComponent', () => {
  let component: MariokartComponent;
  let fixture: ComponentFixture<MariokartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MariokartComponent]
    });
    fixture = TestBed.createComponent(MariokartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
