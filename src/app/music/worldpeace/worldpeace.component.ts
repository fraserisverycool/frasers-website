import { Component } from '@angular/core';
import { ImageUrlPipe } from "../../utils/pipes/image-url.pipe";

@Component({
  selector: 'app-worldpeace',
  imports: [ImageUrlPipe],
  templateUrl: './worldpeace.component.html',
  styleUrls: ['./worldpeace.component.css']
})
export default class WorldpeaceComponent {}
