import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KkModalComponent } from './kk-modal.component';

describe('KkModalComponent', () => {
  let component: KkModalComponent;
  let fixture: ComponentFixture<KkModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [KkModalComponent]
    });
    fixture = TestBed.createComponent(KkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
