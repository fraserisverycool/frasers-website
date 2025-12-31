import {Component, Input, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-custom-marquee',
    imports: [CommonModule],
    templateUrl: './custom-marquee.component.html',
    styleUrls: ['./custom-marquee.component.css']
})
export class CustomMarqueeComponent implements OnInit {
  @Input() messages: string[] = [];
  currentMessage: string = '';
  private currentIndex: number = 0;

  ngOnInit() {
    this.updateMessage();
    setInterval(() => this.updateMessage(), 20000);
  }

  private updateMessage() {
    this.currentMessage = this.messages[this.currentIndex];
    this.currentIndex = (this.currentIndex + 1) % this.messages.length;
  }
}
