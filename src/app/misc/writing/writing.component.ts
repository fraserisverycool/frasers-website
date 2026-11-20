import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ImageUrlPipe } from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-writing',
    imports: [NgOptimizedImage, ImageUrlPipe],
    templateUrl: './writing.component.html',
    styleUrls: ['./writing.component.css']
})
export default class WritingComponent {}
