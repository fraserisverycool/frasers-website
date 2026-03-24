import {Component, Input} from '@angular/core';
@Component({
    selector: 'app-spoiler-discussion',
    imports: [],
    templateUrl: './spoiler-discussion.component.html',
    styleUrls: ['./spoiler-discussion.component.css']
})
export class SpoilerDiscussionComponent {
  @Input() spoiler: string = '';
  showSpoiler: boolean = false;
  toggleSpoiler() {
    this.showSpoiler = !this.showSpoiler;
  }
}
