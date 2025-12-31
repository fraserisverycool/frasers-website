import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-writing',
    imports: [NgOptimizedImage],
    templateUrl: './writing.component.html',
    styleUrls: ['./writing.component.css']
})
export default class WritingComponent {
  constructor(protected imageService: ImageService) {
  }
}
