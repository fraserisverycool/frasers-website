import { ClickedOutsideDirective } from './clicked-outside.directive';
import { ElementRef } from "@angular/core";
import { TestBed } from '@angular/core/testing';

describe('ClickedOutsideDirective', () => {
  let element: HTMLElement;
  let directive: ClickedOutsideDirective;

  beforeEach(() => {
    element = document.createElement('div');
    TestBed.configureTestingModule({
      providers: [{ provide: ElementRef, useValue: new ElementRef(element) }]
    });
    directive = TestBed.runInInjectionContext(() => new ClickedOutsideDirective());
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should emit when clicking outside the element', () => {
    const spy = spyOn(directive.clickedOutside, 'emit');
    directive.onClick(document.body);
    expect(spy).toHaveBeenCalled();
  });

  it('should not emit when clicking inside the element', () => {
    const spy = spyOn(directive.clickedOutside, 'emit');
    directive.onClick(element);
    expect(spy).not.toHaveBeenCalled();
  });
});
