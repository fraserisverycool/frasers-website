import {Component, input, signal} from '@angular/core';

@Component({
    selector: 'app-read-more',
    templateUrl: './read-more.component.html',
    styleUrls: ['./read-more.component.css']
})
export class ReadMoreComponent {
  readonly paragraphs = input<string[]>([]);
  readonly showAll = signal(false);

  toggleShowAll() {
    this.showAll.update(v => !v);
  }
}
