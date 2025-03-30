import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-links',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NgOptimizedImage],
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.css']
})
export default class LinksComponent {
  constructor(private router: Router) {}

  handleClick(url: string) {
    this.router.navigate([url]);
  }
}
