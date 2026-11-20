import {Component, input, signal} from '@angular/core';

@Component({
    selector: 'app-spoiler-discussion',
    templateUrl: './spoiler-discussion.component.html',
    styleUrls: ['./spoiler-discussion.component.css']
})
export class SpoilerDiscussionComponent {
  readonly spoiler = input<string>('');
  readonly showSpoiler = signal(false);

  toggleSpoiler() {
    this.showSpoiler.update(v => !v);
  }
}
