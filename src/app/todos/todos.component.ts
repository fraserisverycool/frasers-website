import { Component, inject, signal } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [NgFor],
  templateUrl: './todos.component.html',
  styleUrls: ['./todos.component.css']
})
export default class TodosComponent {
}
