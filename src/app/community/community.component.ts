import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ImageUrlPipe } from "../utils/pipes/image-url.pipe";

@Component({
    selector: 'app-community',
    imports: [RouterLink, NgOptimizedImage, ImageUrlPipe],
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.css']
})
export default class CommunityComponent {}
