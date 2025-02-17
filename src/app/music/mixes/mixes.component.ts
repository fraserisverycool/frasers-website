import {Component} from '@angular/core';
import { CommonModule } from '@angular/common';

interface Mp3Info {
  filename: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-mixes',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mixes.component.html',
  styleUrls: ['./mixes.component.css']
})
export default class MixesComponent {

  ngOnInit(): void {
    this.loadMixes();
  }

  loadMixes(): void {
    this.http.get<{ mixes: Soundtrack[] }>('assets/music/mixes/mixes.json').subscribe({
      next: (data) => {
        this.mp3Files = data.mixes;
      },
      error: (err) => {
        console.error('Failed to load mixes:', err);
      },
    });
  }

  mp3Files: Mp3Info[] = [
    {
      filename: "animal_crossing_wild_world.mp3",
      name: "Animal Crossing Wild World Mix",
      description: "This is a collection of all the hourly themes from this classic Animal Crossing soundtrack. It starts in the night time, so get excited for those unique cozy nighttime vibes"
    },
    {
      filename: "animal_crossing_new_leaf.mp3",
      name: "Animal Crossing New Leaf Mix",
      description: "Animal Crossing New Leaf really changed the vibe when it comes to the hourly themes. Richer, more lush, the loops twice as long. A special kind of vibe that we must cherish"
    },
    {
      filename: "arms_mix.mp3",
      name: "ARMS Mix",
      description: "Lowkey ARMS has a great soundtrack. That legendary main theme and the various stages are all represented in this mix. Credits theme also a banger"
    }
  ];

  getRandomColor() {
    const r = Math.floor(Math.random() * 128);
    const g = Math.floor(Math.random() * 128);
    const b = Math.floor(Math.random() * 128);

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
}
