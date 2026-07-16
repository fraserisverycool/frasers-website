import { ComponentFixture, TestBed } from '@angular/core/testing';

import PlaylistsComponent from './playlists.component';

describe('PlaylistsComponent', () => {
  let component: PlaylistsComponent;
  let fixture: ComponentFixture<PlaylistsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PlaylistsComponent]
    });
    fixture = TestBed.createComponent(PlaylistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render audio players for each mix', () => {
    component.mp3Files = [
      { id: '1', name: 'Mix 1', description: 'Desc 1', filename: 'mix1.mp3', image: 'placeholder.jpg', rating: [5,5,5,5,5,5], newsletter: false }
    ];
    fixture.detectChanges();
    const audioElements = fixture.nativeElement.querySelectorAll('audio');
    expect(audioElements.length).toBeGreaterThan(0);
    expect(audioElements[0].src).toContain('mix1.mp3');
  });
});
