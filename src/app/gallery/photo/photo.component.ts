import {Component, Input} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import {FormsModule} from "@angular/forms";
import {Photo} from "../photo.interface";
import {RatingBarComponent} from "../../utils/rating-bar/rating-bar.component";

@Component({
  selector: 'app-photo',
  standalone: true,
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
    answer: [""]
  });

  userAnswer = "";
  showText = false;

  modalImage: Photo | null = null;

  checkAnswer(answer: string) {
    const userAnswer = answer.trim().toLowerCase();
    if (this.photo.answer.some(answer => answer.toLowerCase() === userAnswer.toLowerCase())) {
      this.showText = true;
    } else {
      alert('Incorrect answer. Please try again.');
    }
    this.userAnswer = '';
  }

  openModal(item: Photo) {
    this.modalImage = item;
  }

  closeModal() {
    this.modalImage = null;
  }

}
