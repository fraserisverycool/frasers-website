import { Component, OnInit, inject, signal } from '@angular/core';

import {ChangelogEntry} from "../changelog-entry.interface";
import { HttpClient } from "@angular/common/http";

@Component({
    selector: 'app-changelog',
    imports: [],
    templateUrl: './changelog.component.html',
    styleUrls: ['./changelog.component.css']
})
export class ChangelogComponent implements OnInit {
  private http = inject(HttpClient);

  readonly changelogEntries = signal<ChangelogEntry[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.http.get('assets/data/changelog.csv', { responseType: 'text' })
      .subscribe({
        next: (content) => this.parseChangelog(content),
        error: () => this.error.set('Could not load changelog file.')
      });
  }

  private parseChangelog(content: string): void {
    const entries: ChangelogEntry[] = [];
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(',').map(p => p.trim());

      if (parts.length < 2) continue;

      entries.push({
        date: parts[0],
        message: parts[1],
        majorRelease: parts[2] === 'TRUE'  // Convert to boolean
      });
    }

    this.changelogEntries.set(entries);

    if (entries.length === 0) {
      this.error.set('No valid changelog entries found.');
    }
  }
}
