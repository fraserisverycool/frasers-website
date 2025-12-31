import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {filter} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-root',
    imports: [CommonModule, RouterOutlet, RouterLink],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Fraser\'s Website';

  constructor(private router: Router, private titleService: Title) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        map(() => {
          let child = this.router.routerState.snapshot.root;
          while (child.firstChild) {
            child = child.firstChild;
          }
          return child;
        }),
        filter((route) => route.outlet === 'primary')
      )
      .subscribe((route) => {
        window.scroll(0, 0);
        if (route.data['title']) {
          this.titleService.setTitle(route.data['title']);
        }
      });
  }
}
