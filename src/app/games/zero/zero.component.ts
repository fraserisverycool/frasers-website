import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-oranges',
  standalone: true,
  imports: [NgFor],
  templateUrl: './zero.component.html',
  styleUrls: ['./zero.component.css']
})
export default class ZeroComponent {
}
