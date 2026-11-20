import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {NavigationEnd, Router, RouterLink, RouterOutlet} from '@angular/router';
import {Title} from "@angular/platform-browser";
import {filter} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
  private router = inject(Router);
  private titleService = inject(Title);

  readonly title = 'Fraser\'s Website';

  constructor() {
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
        filter((route) => route.outlet === 'primary'),
        takeUntilDestroyed()
      )
      .subscribe((route) => {
        window.scroll(0, 0);
        if (route.data['title']) {
          this.titleService.setTitle(route.data['title']);
        }
      });
  }
}
