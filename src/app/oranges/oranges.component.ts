import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-oranges',
  standalone: true,
  imports: [NgFor],
  templateUrl: './oranges.component.html',
  styleUrls: ['./oranges.component.css']
})
export default class OrangesComponent {
}
