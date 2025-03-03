import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import Photo from "./gallery.component";

@Component({
  selector: 'app-photo',
  standalone: true,
  imports: [CommonModule, Photo],
  templateUrl: './photo.component.html',
  styleUrls: ['./photo.component.css']
})
export default class PhotoComponent {
  @input photo: Photo = <Photo>({
    filename: "";
    title: "";
    description: "";
    month: "";
    question: "";
    answer: "";
  });

  password = '';
  correctPassword = this.photo.answer;
  showText = false;

  checkPassword() {
    if (this.password === this.correctPassword) {
      this.showText = true;
    } else {
      alert('Incorrect password');
    }
  }

}
