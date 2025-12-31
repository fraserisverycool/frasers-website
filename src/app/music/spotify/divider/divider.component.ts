import { Component, Input } from '@angular/core';


@Component({
    selector: 'app-divider',
    imports: [],
    templateUrl: './divider.component.html',
    styleUrls: ['./divider.component.css']
})
export class DividerComponent {
  @Input() height: number = 50;
}
