import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-writing',
    imports: [CommonModule, NgOptimizedImage],
    templateUrl: './writing.component.html',
    styleUrls: ['./writing.component.css']
})
export default class WritingComponent {
  constructor(protected imageService: ImageService) {
  }
}
