import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-two',
  standalone: true,
  imports: [NgFor],
  templateUrl: './two.component.html',
  styleUrls: ['./two.component.css']
})
export default class TwoComponent {
}
