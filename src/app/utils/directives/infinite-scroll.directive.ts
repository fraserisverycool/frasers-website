import { Directive, ElementRef, OnDestroy, OnInit, inject, input, output } from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  private elementRef = inject(ElementRef);

  readonly scrollRootMargin = input<string>('100px');
  readonly scrollNearEnd = output<void>();
  readonly appInfiniteScroll = output<void>();

  private observer?: IntersectionObserver;

  ngOnInit(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        this.scrollNearEnd.emit();
        this.appInfiniteScroll.emit();
      }
    }, {
      rootMargin: this.scrollRootMargin()
    });

    this.observer.observe(this.elementRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.observer = undefined;
  }
}
