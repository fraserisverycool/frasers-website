import { ComponentFixture, TestBed } from '@angular/core/testing';

import KkComponent from './kk.component';

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

  it('should show modal when showDescription is called', () => {
    const song = { id: '1', title: 'K.K. Bossa', description: 'Nice song', filename: 'kk-bossa.png', tier: 'S', rating: [5,5,5,5,5,5], newsletter: false };
    component.showDescription(song);
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('app-kk-modal');
    expect(modal).toBeTruthy();
  });

  it('should show audio player in modal if a matching audio file exists', () => {
    const song = { id: '12', title: 'K.K. Bossa', description: 'Bossa Nova vibe', filename: 'kk-bossa.png', tier: 'S', rating: [5,5,5,5,5,5], newsletter: false };
    component.showDescription(song);
    fixture.detectChanges();
    const audio = fixture.nativeElement.querySelector('audio');
    expect(audio).toBeTruthy();
    expect(audio.src).toContain('2-12%20K.K.%20Bossa%20(Radio).mp3');
  });
});
