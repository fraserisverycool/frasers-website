import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';


@Component({
    selector: 'app-custom-marquee',
    imports: [],
    templateUrl: './custom-marquee.component.html',
    styleUrls: ['./custom-marquee.component.css']
})
export class CustomMarqueeComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  readonly messages = input<string[]>([]);
  readonly currentMessage = signal('');
  private currentIndex: number = 0;

  ngOnInit() {
    this.updateMessage();
    const intervalId = setInterval(() => this.updateMessage(), 20000);
    this.destroyRef.onDestroy(() => clearInterval(intervalId));
  }

  private updateMessage() {
    this.currentMessage.set(this.messages()[this.currentIndex]);
    this.currentIndex = (this.currentIndex + 1) % this.messages().length;
  }
}
