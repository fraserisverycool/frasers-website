import {Component, Input} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {Photo} from "../photo.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";
import {PhotoService} from "./service/photo.service";
import {ImageService} from "../../utils/services/image.service";

@Component({
    selector: 'app-photo',
    imports: [CommonModule, FormsModule, NgOptimizedImage, RatingBarComponent],
    templateUrl: './photo.component.html',
    styleUrls: ['./photo.component.css']
})
export default class PhotoComponent {
  @Input() photo: Photo = <Photo>({
    filename: "",
    title: "",
    description: "",
    month: "",
    question: "",
    answer: [""],
    id: "",
    rating: [0,0,0,0,0,0]
  });

  userAnswer = "";
  showText = false;

  modalImage: Photo | null = null;

  constructor(private service: PhotoService, protected imageService: ImageService) {}

  checkAnswer(answer: string) {
    this.service.postAnswer(this.photo.id, answer).subscribe(
      (data) => {
        this.photo.description = data['anecdote'];
        this.photo.unmasked = data['unmasked'];
        this.showText = true;
      },
      (error) => {
        alert('Incorrect answer. Please try again.');
      }
    );
  }

  openModal(item: Photo) {
    this.modalImage = item;
  }

  closeModal() {
    this.modalImage = null;
  }

}
