import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThreeComponent } from './three.component';

describe('ThreeComponent', () => {
  let component: ThreeComponent;
  let fixture: ComponentFixture<ThreeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ThreeComponent]
    });
    fixture = TestBed.createComponent(ThreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
