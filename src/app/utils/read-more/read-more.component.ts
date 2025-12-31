import {Component, Input} from '@angular/core';


@Component({
    selector: 'app-read-more',
    imports: [],
    templateUrl: './read-more.component.html',
    styleUrls: ['./read-more.component.css']
})
export class ReadMoreComponent {
  @Input() paragraphs: string[] = [];
  showAll: boolean = false;

  toggleShowAll() {
    this.showAll = !this.showAll;
  }
}
