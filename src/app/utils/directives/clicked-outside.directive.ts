import { Directive, ElementRef, inject, output } from '@angular/core';

@Directive({
  selector: '[appClickedOutside]',
  host: {
    '(window:click)': 'onClick($event.target)',
    '(document:keydown.escape)': 'clickedOutside.emit()',
  }
})
export class ClickedOutsideDirective {
  private el = inject(ElementRef);

  readonly clickedOutside = output<void>();

  onClick(target: EventTarget | null) {
    if (!this.el.nativeElement.contains(target)) {
      this.clickedOutside.emit();
    }
  }
}
