import { ComponentFixture, TestBed } from '@angular/core/testing';
import ColorPickerComponent from './color-picker.component';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

describe('ColorPickerComponent', () => {
  let component: ColorPickerComponent;
  let fixture: ComponentFixture<ColorPickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ColorPickerComponent, FormsModule]
    });
    fixture = TestBed.createComponent(ColorPickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update color and emit event when a color button is clicked', () => {
    spyOn(component.colorChange, 'emit');
    const colorToSelect = '#3498db';

    // Find the button with background-color: #3498db
    const buttons = fixture.debugElement.queryAll(By.css('.color-button'));
    const blueButton = buttons.find(btn => btn.nativeElement.style.backgroundColor === 'rgb(52, 152, 219)'); // #3498db in RGB

    expect(blueButton).toBeTruthy();
    blueButton?.nativeElement.click();

    expect(component.color).toBe(colorToSelect);
    expect(component.colorChange.emit).toHaveBeenCalledWith(colorToSelect);
  });

  it('should update color and emit event when text input changes', () => {
    spyOn(component.colorChange, 'emit');
    const inputElement = fixture.debugElement.query(By.css('input')).nativeElement;

    inputElement.value = '#ff0000';
    inputElement.dispatchEvent(new Event('input'));

    expect(component.color).toBe('#ff0000');
    expect(component.colorChange.emit).toHaveBeenCalledWith('#ff0000');
  });

  it('should apply the "selected" class to the active color button', () => {
    component.color = '#ffffff';
    fixture.detectChanges();

    // Check all buttons, find the one that should be selected
    const buttons = fixture.debugElement.queryAll(By.css('.color-button'));
    const whiteButton = buttons.find(btn => btn.nativeElement.getAttribute('aria-label') === 'White');
    const blueButton = buttons.find(btn => btn.nativeElement.getAttribute('aria-label') === 'Blue');

    expect(whiteButton?.nativeElement.classList).toContain('selected');
    expect(blueButton?.nativeElement.classList).not.toContain('selected');
  });
});
