import { ComponentFixture, TestBed } from '@angular/core/testing';

import PartyComponent from './party.component';

describe('PartyComponent', () => {
  let component: PartyComponent;
  let fixture: ComponentFixture<PartyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PartyComponent]
    });
    fixture = TestBed.createComponent(PartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
