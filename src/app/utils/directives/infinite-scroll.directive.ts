import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';

@Directive({
  selector: '[appInfiniteScroll]',
  standalone: true
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input() scrollRootMargin: string = '100px';
  @Output() scrollNearEnd = new EventEmitter<void>();
  @Output() appInfiniteScroll = new EventEmitter<void>();

  private observer?: IntersectionObserver;

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    this.setupObserver();
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  private setupObserver(): void {
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry && entry.isIntersecting) {
        this.scrollNearEnd.emit();
        this.appInfiniteScroll.emit();
      }
    }, {
      rootMargin: this.scrollRootMargin
    });

    if (this.elementRef?.nativeElement) {
      this.observer.observe(this.elementRef.nativeElement);
    }
  }

  private disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
  }
}
