import {Directive, ElementRef, EventEmitter, HostListener, Input, Output} from '@angular/core';

@Directive({
  selector: '[appClickedOutside]',
  standalone: true
})
export class ClickedOutsideDirective {

  constructor(private el: ElementRef) { }

  @Output() public clickedOutside = new EventEmitter();

  @HostListener('window:click', ['$event.target'])
  public onClick(target: any) {
    const clickedInside = this.el.nativeElement.contains(target);
    if (!clickedInside) {
      this.clickedOutside.emit(null);
    }
  }

  @HostListener('document:keydown', ['$event'])
  public onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.clickedOutside.emit(null);
    }
  }

}
