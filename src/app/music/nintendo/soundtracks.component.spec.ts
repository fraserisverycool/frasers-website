import { ComponentFixture, TestBed } from '@angular/core/testing';

import SoundtracksComponent from './soundtracks.component';

describe('SoundtracksComponent', () => {
  let component: SoundtracksComponent;
  let fixture: ComponentFixture<SoundtracksComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SoundtracksComponent]
    });
    fixture = TestBed.createComponent(SoundtracksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
