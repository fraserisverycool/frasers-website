import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ImageService} from "../../utils/services/image.service";

@Component({
  selector: 'app-worldpeace',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './worldpeace.component.html',
  styleUrls: ['./worldpeace.component.css']
})
export default class WorldpeaceComponent {
  constructor(protected imageService: ImageService) {
  }
}
