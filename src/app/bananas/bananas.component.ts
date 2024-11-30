import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-bananas',
  standalone: true,
  imports: [NgFor],
  templateUrl: './bananas.component.html',
  styleUrls: ['./bananas.component.css']
})
export default class BananasComponent {
}
