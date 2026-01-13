import { ClickedOutsideDirective } from './clicked-outside.directive';
import {ElementRef} from "@angular/core";

describe('ClickedOutsideDirective', () => {
  it('should create an instance', () => {
    const directive = new ClickedOutsideDirective(new ElementRef(null));
    expect(directive).toBeTruthy();
  });
});
