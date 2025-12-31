import { Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import {ImageService} from "../utils/services/image.service";

@Component({
    selector: 'app-community',
    imports: [RouterLink, NgOptimizedImage],
    templateUrl: './community.component.html',
    styleUrls: ['./community.component.css']
})
export default class CommunityComponent {
  constructor(protected imageService: ImageService) {}
}
