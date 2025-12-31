import { Component } from '@angular/core';

import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-worldpeace',
    imports: [],
    templateUrl: './worldpeace.component.html',
    styleUrls: ['./worldpeace.component.css']
})
export default class WorldpeaceComponent {
  constructor(protected imageService: ImageService) {
  }
}
