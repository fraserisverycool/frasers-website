import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-star-message',
    imports: [CommonModule],
    templateUrl: './star-message.component.html',
    styleUrls: ['./star-message.component.css']
})
export default class StarMessageComponent {
  @Input() score: string = '';
  @Input() description: string = '';
}
