import { Component, input } from '@angular/core';


@Component({
    selector: 'app-divider',
    imports: [],
    templateUrl: './divider.component.html',
    styleUrls: ['./divider.component.css']
})
export class DividerComponent {
  readonly height = input<number>(50);
}
