import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KkComponent } from './kk.component';

describe('KkComponent', () => {
  let component: KkComponent;
  let fixture: ComponentFixture<KkComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KkComponent]
    });
    fixture = TestBed.createComponent(KkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
