import { Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-community',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, NgOptimizedImage],
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css']
})
export default class CommunityComponent {
  constructor(private router: Router) {}

  handleClick(url: string) {
    this.router.navigate([url]);
  }
}
