import { ComponentFixture, TestBed } from '@angular/core/testing';

import MixesComponent from './mixes.component';

describe('MixesComponent', () => {
  let component: MixesComponent;
  let fixture: ComponentFixture<MixesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MixesComponent]
    });
    fixture = TestBed.createComponent(MixesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render audio players for each mix', () => {
    component.mp3Files = [
      { id: '1', name: 'Mix 1', description: 'Desc 1', filename: 'mix1.mp3', rating: [5,5,5,5,5,5], newsletter: false }
    ];
    fixture.detectChanges();
    const audioElements = fixture.nativeElement.querySelectorAll('audio');
    expect(audioElements.length).toBeGreaterThan(0);
    expect(audioElements[0].src).toContain('mix1.mp3');
  });
});
