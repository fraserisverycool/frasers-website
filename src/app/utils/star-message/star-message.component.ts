import { Component, input } from '@angular/core';


@Component({
    selector: 'app-star-message',
    imports: [],
    templateUrl: './star-message.component.html',
    styleUrls: ['./star-message.component.css']
})
export default class StarMessageComponent {
  readonly score = input<string>('');
  readonly description = input<string>('');
}
