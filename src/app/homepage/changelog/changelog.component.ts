import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from "@angular/common/http";

interface ChangelogEntry {
  date: string;
  message: string;
  majorRelease: boolean;
}

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './changelog.component.html',
  styleUrls: ['./changelog.component.css']
})
export default class ChangelogComponent implements OnInit {
  changelogEntries: ChangelogEntry[] = [];
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get('assets/homepage/changelog/changelog.csv', { responseType: 'text' })
      .subscribe({
        next: (content) => this.parseChangelog(content),
        error: () => this.error = 'Could not load changelog file.'
      });
  }

  private parseChangelog(content: string): void {
    this.changelogEntries = [];
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      if (!line.trim()) continue;

      // Split by comma and remove whitespace
      const parts = line.split(',').map(p => p.trim());

      // Require at least 2 columns (date + message)
      if (parts.length < 2) continue;

      this.changelogEntries.push({
        date: parts[0],
        message: parts[1],
        majorRelease: parts[2] === 'TRUE'  // Convert to boolean
      });
    }

    if (this.changelogEntries.length === 0) {
      this.error = 'No valid changelog entries found.';
    }
  }
}
