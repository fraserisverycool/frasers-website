import { ComponentFixture, TestBed } from '@angular/core/testing';
import ColorPickerComponent from './color-picker.component';
import { By } from '@angular/platform-browser';

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;
  let emitted: string[];

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ColorPickerComponent]
    });
    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;
    emitted = [];
    component.color.subscribe(c => emitted.push(c));
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update color and emit colorChange when a color button is clicked', () => {
    const buttons = fixture.debugElement.queryAll(By.css('.color-button'));
    const blueButton = buttons.find(btn => btn.nativeElement.style.backgroundColor === 'rgb(52, 152, 219)'); // #3498db

    expect(blueButton).toBeTruthy();
    blueButton?.nativeElement.click();

    expect(component.color()).toBe('#3498db');
    expect(emitted).toEqual(['#3498db']);
  });

  it('should update color and emit colorChange when text input changes', () => {
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    inputElement.value = '#ff0000';
    inputElement.dispatchEvent(new Event('input'));

    expect(component.color()).toBe('#ff0000');
    expect(emitted).toEqual(['#ff0000']);
  });

  it('should apply the "selected" class to the active color button', async () => {
    fixture.componentRef.setInput('color', '#ffffff');
    await fixture.whenStable();

    const buttons = fixture.debugElement.queryAll(By.css('.color-button'));
    const whiteButton = buttons.find(btn => btn.nativeElement.getAttribute('aria-label') === 'White');
    const blueButton = buttons.find(btn => btn.nativeElement.getAttribute('aria-label') === 'Blue');

    expect(whiteButton?.nativeElement.classList).toContain('selected');
    expect(blueButton?.nativeElement.classList).not.toContain('selected');
  });
});
