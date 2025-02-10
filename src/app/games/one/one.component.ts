import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-one',
  standalone: true,
  imports: [NgFor],
  templateUrl: './one.component.html',
  styleUrls: ['./one.component.css']
})
export default class OneComponent {
}
