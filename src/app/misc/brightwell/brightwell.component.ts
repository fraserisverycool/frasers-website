import { Component } from '@angular/core';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-brightwell',
  imports: [],
  templateUrl: './brightwell.component.html',
  styleUrl: './brightwell.component.css',
})
export default class BrightwellComponent {
  path: string = `${environment.imageBaseUrl}/misc/brightwell/Brightwell.html`;
}
