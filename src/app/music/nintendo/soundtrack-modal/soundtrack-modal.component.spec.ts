import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SoundtrackModalComponent } from './soundtrack-modal.component';

describe('SoundtrackModalComponent', () => {
  let component: SoundtrackModalComponent;
  let fixture: ComponentFixture<SoundtrackModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SoundtrackModalComponent]
    });
    fixture = TestBed.createComponent(SoundtrackModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
