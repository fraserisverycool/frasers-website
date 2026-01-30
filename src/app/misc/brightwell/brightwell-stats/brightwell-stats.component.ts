import {Component, OnInit} from '@angular/core';
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-brightwell-stats',
  imports: [],
  templateUrl: './brightwell-stats.component.html',
  styleUrl: './brightwell-stats.component.css',
})
export default class BrightwellStatsComponent implements OnInit{
  stats: any[] = [];

  endingTitles: { [key: string]: string } = {
    'ending1': 'Safely in Brightwell',
    'ending2': 'Fruit arrives to Brightwell',
    'ending3': 'Island Life, Muriel AWOL',
    'ending4': 'Island Life, Muriel survived',
    'ending5': 'Island Life, Muriel dead',
    'ending6': 'Died at Sea',
    'ending7': 'Cold Turkey in Brightwell'
  };

  getEndingTitle(endingId: string): string {
    return this.endingTitles[endingId] || endingId;
  }

  private fetchStats() {
    fetch(`${environment.apiUrl}/brightwell/stats`)
      .then(response => response.json())
      .then(data => {
        this.stats = data.sort((a: any, b: any) => a.ending.localeCompare(b.ending));
      })
      .catch(error => console.error('Error fetching ending stats:', error));
  }

  ngOnInit() {
    this.fetchStats();
  }
}
