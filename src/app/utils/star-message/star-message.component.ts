import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-star-message',
    imports: [],
    templateUrl: './star-message.component.html',
    styleUrls: ['./star-message.component.css']
})
export default class StarMessageComponent {
  @Input() score: string = '';
  @Input() description: string = '';
}
