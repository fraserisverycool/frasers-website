import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ChangelogComponent} from "./changelog/changelog.component";

@Component({
  selector: 'app-changelog-page',
  standalone: true,
  imports: [CommonModule, ChangelogComponent],
  templateUrl: './changelog-page.component.html',
  styleUrls: ['./changelog-page.component.css']
})
export default class ChangelogPageComponent {}
