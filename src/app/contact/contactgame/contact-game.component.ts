import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import Phaser from 'phaser';

@Component({
  selector: 'app-contactgame',
  imports: [CommonModule],
  templateUrl: './contact-game.component.html',
  styleUrl: './contact-game.component.css',
})
export class ContactGameComponent implements AfterViewInit, OnDestroy {
  @ViewChild('gameContainer') gameContainer?: ElementRef<HTMLDivElement>;

  hasWon = false;
  hasFailed = false;
  emailImageSrc = '';
  score = 0;
  lives = 3;
  private game?: Phaser.Game;
  private readonly sceneKey = 'contact-maze';

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    this.initGame();
  }

  ngOnDestroy(): void {
    this.destroyGame();
  }

  private initGame(): void {
    if (this.game || !this.gameContainer) {
      return;
    }

    const scene = this.createScene();
    this.ngZone.runOutsideAngular(() => {
      this.game = new Phaser.Game({
        type: Phaser.AUTO,
        width: 520,
        height: 520,
        parent: this.gameContainer?.nativeElement,
        render: {
          antialias: true,
          antialiasGL: true,
          pixelArt: false,
          roundPixels: false,
          transparent: true,
        },
        physics: {
          default: 'arcade',
          arcade: {
            debug: false,
          },
        },
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
          width: 520,
          height: 520,
        },
        scene,
      });
    });
  }

  private destroyGame(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = undefined;
    }
  }

  private handleWin(): void {
    if (this.hasWon || this.hasFailed) {
      return;
    }

    this.score = 2000 + this.lives * 150;
    this.hasWon = true;
    this.emailImageSrc = this.buildEmailImage();
  }

  resetGame(): void {
    this.hasWon = false;
    this.hasFailed = false;
    this.emailImageSrc = '';
    this.score = 0;
    this.lives = 3;

    if (this.game) {
      const scene = this.game.scene.getScene(this.sceneKey);
      scene.scene.restart();
    }
  }

  private handleFailure(): void {
    if (this.hasWon || this.hasFailed) {
      return;
    }

    this.hasFailed = true;
    this.lives = 0;
    this.score = 0;
  }

  private createScene(): Phaser.Scene {
    const component = this;
    const start = { x: 60, y: 460 };
    const goal = { x: 460, y: 60 };

    return new (class extends Phaser.Scene {
      private ended = false;

      constructor() {
        super(component.sceneKey);
      }

      preload(): void {
        this.load.image('orb', 'assets/homepage/contact/sun-again.png');
        this.load.image('cloud', 'assets/homepage/contact/cloud2.png');
        this.load.image('goal', 'assets/homepage/contact/tree.png');
      }

      create(): void {
        this.ended = false;
        const width = 520;
        const height = 520;
        const orbRadius = 24;
        const cloudSize = { w: 96, h: 56 };
        const goalSize = { w: 64, h: 64 };

        const orbTexture = this.textures.get('orb');
        orbTexture.setFilter(Phaser.Textures.FilterMode.LINEAR);

        const walls = this.buildWalls(start, goal, width, height, cloudSize);

        const wallObjects = walls.map((wall) => {
          const cloud = this.add.image(wall.x, wall.y, 'cloud');
          cloud.setDisplaySize(wall.w, wall.h);
          this.physics.add.existing(cloud, true);
          const cloudBody = cloud.body as Phaser.Physics.Arcade.StaticBody;
          cloudBody.setSize(wall.w, wall.h, true);
          return cloud;
        });

        const goalZone = this.add.image(goal.x, goal.y, 'goal');
        goalZone.setDisplaySize(goalSize.w, goalSize.h);
        this.physics.add.existing(goalZone, true);
        const goalBody = goalZone.body as Phaser.Physics.Arcade.StaticBody;
        goalBody.setSize(goalSize.w, goalSize.h, true);

        const player = this.add.image(start.x, start.y, 'orb');
        player.setDisplaySize(orbRadius * 2, orbRadius * 2);
        player.setOrigin(0.5, 0.5);
        this.physics.add.existing(player);
        const playerBody = player.body as Phaser.Physics.Arcade.Body;
        playerBody.setSize(player.displayWidth, player.displayHeight, true);
        playerBody.setAllowGravity(false);
        playerBody.setImmovable(true);

        player.setInteractive({ useHandCursor: true });
        this.input.setDraggable(player);

        const failRun = () => {
          if (this.ended) {
            return;
          }
          this.ended = true;
          player.disableInteractive();
          component.ngZone.run(() => component.handleFailure());
          this.tweens.add({
            targets: player,
            alpha: 0.2,
            duration: 80,
            yoyo: true,
            repeat: 2,
          });
        };

        this.input.on('drag', (_pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject, dragX: number, dragY: number) => {
          if (this.ended || gameObject !== player) {
            return;
          }
          const min = orbRadius;
          const maxX = width - min;
          const maxY = height - min;
          if (dragX < min || dragX > maxX || dragY < min || dragY > maxY) {
            failRun();
            return;
          }
          player.setPosition(dragX, dragY);
          playerBody.updateFromGameObject();
        });

        wallObjects.forEach((wall) => {
          this.physics.add.overlap(player, wall, failRun);
        });

        this.physics.add.overlap(player, goalZone, () => {
          if (this.ended) {
            return;
          }
          this.ended = true;
          player.disableInteractive();
          component.ngZone.run(() => component.handleWin());
        });
      }

      private buildWalls(
        start: { x: number; y: number },
        goal: { x: number; y: number },
        width: number,
        height: number,
        cloudSize: { w: number; h: number }
      ) {
        const walls: Array<{ x: number; y: number; w: number; h: number }> = [];
        const maxWalls = Phaser.Math.Between(14, 16);
        const attempts = 140;
        const margin = 6;
        const edgeSnapChance = 0.35;
        const keepout = [
          { x: start.x, y: start.y, w: 120, h: 120 },
          { x: goal.x, y: goal.y, w: 120, h: 120 },
        ];

        const intersects = (a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }) => {
          return Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;
        };

        for (let i = 0; i < attempts && walls.length < maxWalls; i += 1) {
          const w = cloudSize.w;
          const h = cloudSize.h;
          let x = Phaser.Math.Between(margin + w / 2, width - margin - w / 2);
          let y = Phaser.Math.Between(margin + h / 2, height - margin - h / 2);
          if (Phaser.Math.FloatBetween(0, 1) < edgeSnapChance) {
            const snapLeft = Phaser.Math.Between(0, 1) === 0;
            x = snapLeft ? w / 2 + margin : width - w / 2 - margin;
          } else if (Phaser.Math.FloatBetween(0, 1) < edgeSnapChance) {
            const snapTop = Phaser.Math.Between(0, 1) === 0;
            y = snapTop ? h / 2 + margin : height - h / 2 - margin;
          }
          const candidate = { x, y, w, h };

          const nearStartOrGoal = keepout.some((zone) => intersects(candidate, zone));
          const overlapsWall = walls.some((wall) => intersects(candidate, wall));
          if (nearStartOrGoal || overlapsWall) {
            continue;
          }

          walls.push(candidate);
        }

        return walls;
      }
    })();
  }

  private buildEmailImage(): string {
    const email = `${this.emailUser()}@${this.emailDomain()}.${this.emailTld()}`;

    if (typeof document === 'undefined') {
      return '';
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      return '';
    }

    const font = '20px "Trebuchet MS", "Verdana", sans-serif';
    const paddingX = 20;
    const paddingY = 14;

    context.font = font;
    const textWidth = Math.ceil(context.measureText(email).width);

    canvas.width = textWidth + paddingX * 2;
    canvas.height = 46 + paddingY * 2;

    context.font = font;
    const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#0b1b3a');
    gradient.addColorStop(1, '#1f6ed4');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.lineWidth = 2;
    context.strokeStyle = '#9fdcff';
    context.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);

    context.fillStyle = '#f2fbff';
    context.textBaseline = 'middle';
    context.fillText(email, paddingX, canvas.height / 2);

    return canvas.toDataURL('image/png');
  }

  private emailUser(): string {
    return 'fraserbowen82';
  }

  private emailDomain(): string {
    return 'hotmail';
  }

  private emailTld(): string {
    return 'co.uk';
  }
}
