import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StarmessageComponent } from './starmessage.component';

describe('StarmessageComponent', () => {
  let component: StarmessageComponent;
  let fixture: ComponentFixture<StarmessageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StarmessageComponent]
    });
    fixture = TestBed.createComponent(StarmessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
