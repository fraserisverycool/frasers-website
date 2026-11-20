import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ImageUrlPipe } from "../../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-party',
    imports: [NgOptimizedImage, ImageUrlPipe],
    templateUrl: './party.component.html',
    styleUrls: ['./party.component.css']
})
export default class PartyComponent {}
