import { InfiniteScrollDirective } from './infinite-scroll.directive';
import { ElementRef } from '@angular/core';

describe('InfiniteScrollDirective', () => {
  let elementRef: ElementRef;
  let directive: InfiniteScrollDirective;
  let originalIntersectionObserver: typeof IntersectionObserver;
  let observeSpy: jasmine.Spy;
  let disconnectSpy: jasmine.Spy;
  let observerCallback: (entries: Partial<IntersectionObserverEntry>[]) => void;

  beforeEach(() => {
    elementRef = new ElementRef(document.createElement('div'));
    observeSpy = jasmine.createSpy('observe');
    disconnectSpy = jasmine.createSpy('disconnect');

    originalIntersectionObserver = window.IntersectionObserver;
    (window as any).IntersectionObserver = class {
      constructor(callback: any) {
        observerCallback = callback;
      }
      observe = observeSpy;
      disconnect = disconnectSpy;
      unobserve = jasmine.createSpy('unobserve');
    };

    directive = new InfiniteScrollDirective(elementRef);
  });

  afterEach(() => {
    (window as any).IntersectionObserver = originalIntersectionObserver;
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should setup IntersectionObserver and observe element on ngOnInit', () => {
    directive.ngOnInit();
    expect(observeSpy).toHaveBeenCalledWith(elementRef.nativeElement);
  });

  it('should emit scrollNearEnd and appInfiniteScroll when intersecting', () => {
    const scrollNearEndSpy = spyOn(directive.scrollNearEnd, 'emit');
    const appInfiniteScrollSpy = spyOn(directive.appInfiniteScroll, 'emit');

    directive.ngOnInit();
    observerCallback([{ isIntersecting: true } as any]);

    expect(scrollNearEndSpy).toHaveBeenCalled();
    expect(appInfiniteScrollSpy).toHaveBeenCalled();
  });

  it('should not emit when not intersecting', () => {
    const scrollNearEndSpy = spyOn(directive.scrollNearEnd, 'emit');
    const appInfiniteScrollSpy = spyOn(directive.appInfiniteScroll, 'emit');

    directive.ngOnInit();
    observerCallback([{ isIntersecting: false } as any]);

    expect(scrollNearEndSpy).not.toHaveBeenCalled();
    expect(appInfiniteScrollSpy).not.toHaveBeenCalled();
  });

  it('should disconnect observer on ngOnDestroy', () => {
    directive.ngOnInit();
    directive.ngOnDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
