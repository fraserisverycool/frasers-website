import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmashComponent } from './smash.component';

describe('SmashComponent', () => {
  let component: SmashComponent;
  let fixture: ComponentFixture<SmashComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SmashComponent]
    });
    fixture = TestBed.createComponent(SmashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
