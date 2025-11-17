import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {ImageService} from "../../utils/services/image.service";

@Component({
  selector: 'app-party',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './party.component.html',
  styleUrls: ['./party.component.css']
})
export default class PartyComponent {
  constructor(protected imageService: ImageService) {
  }
}
