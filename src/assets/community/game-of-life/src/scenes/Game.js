import { Scene, Math } from 'phaser';
import { Player } from '../gameobjects/Player.js';
import { Enemy } from '../gameobjects/Enemy.js';
import { SmallEnemy } from '../gameobjects/SmallEnemy.js';
import { Bullet } from '../gameobjects/Bullet.js';
import { EventBus } from '../EventBus.js';

const enemySpawnRate = 500;
let cursors = null;
let pointer = null;
let gamepad = null;
let music = null;
const backgroundSpeed = 2;
let fKey = null;
let pauseKey = null;

export class Game extends Scene {

    constructor ()
    {
        super('Game');
    }

    init() {
        this.score = 0;
        this.tile = null;
        this.cameras.main.fadeIn(1000, 0, 0, 0);
    }


    create (){
        this.tile = this.add.tileSprite(0, 0 , 0 , 0, 'bg-hearth');
        const scaleTileX = this.scale.width / this.tile.width ;
        const scaleTileY = this.scale.height/ this.tile.height;
        this.tile.scaleX = scaleTileX;
        this.tile.scaleY = scaleTileY;
        this.tile.setOrigin(0, 0);
        
        this.tileCloudsTransparent = this.add.tileSprite(0, 0 , this.scale.width , this.scale.height, 'clouds-transparent');
        const scaleCloudsX = this.scale.width / this.tileCloudsTransparent.width ;
        const scaleCloudsY = this.scale.height/ this.tileCloudsTransparent.height;
        this.tileCloudsTransparent.scaleX = scaleCloudsX;
        this.tileCloudsTransparent.scaleY = scaleCloudsY;
        this.tileCloudsTransparent.setOrigin(0, 0);

        var actualWidth = this.scale.width;
        var actualHeight = this.scale.height;

        // Get the scale factors (scaling ratio)
        var scaleX = this.scale.displayScaleX;
        var scaleY = this.scale.displayScaleY;

        this.scoreText = this.add.text(16, 16, 'Score: 0', {
        fontSize: '32px',
        fill: '#fff'
        });

        this.healthText = this.add.text(16, 48, 'Health: 100', {
            fontSize: '32px',
            fill: '#fff'
        });

        this.player = new Player({scene: this, x: 512, y: 384});

        // Set controllers
        cursors = this.input.keyboard.createCursorKeys();
        fKey = this.input.keyboard.addKey('F');
        pauseKey = this.input.keyboard.addKey('ESC');
        pointer = this.input.activePointer;

        // drag the player

        this.enemies = this.physics.add.group({
            classType: Enemy,
            maxSize: 500,
            runChildUpdate: true
        });

        this.time.addEvent({
            delay: enemySpawnRate,            // Time in milliseconds (5000 ms = 5 seconds)
            callback: () => {
                const x = Math.Between(50, this.scale.width - 50);  // Random x within game width
                const y = 0; // Random y within game height
                this.enemies.get(x, y);

            },
            loop: true               // Keep repeating the event
        });

        this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
            player.takeDamage(10);
            enemy.die();
        });

        this.physics.add.overlap(this.player.bullets, this.enemies, (bullet, enemy) => {
            enemy.takeDamage(bullet.damage);
            bullet.destroy();
        });

        this.explosion = this.add.sprite(this.x, this.y, 'explosion')
        this.explosion.setScale(this.scaleX, this.scaleY);
        this.explosion.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 3 }),
            frameRate: 20,
            repeat: 0
        });

        EventBus.on('PlayerTookDamage', (damage) => {
            this.healthText.setText('Health: ' + this.player.health);
        })

        EventBus.on('PlayerDied', () => {
            music.stop();
            this.scene.start('GameOver', { score: this.score });
        });

        EventBus.on('EnemyDied', (enemy) => {
            this.score += enemy.pointValue();
            this.scoreText.setText('Score: ' + this.score);
        });

        const music = this.sound.add('bg-music', {
            loop: true,
            volume: 0.5,
          });

        music.play();
    }

    enemyExploded(enemy) {
        this.explosion.x = enemy.x;
        this.explosion.y = enemy.y;
        this.explosion.visible = true;
        this.explosion.scaleX = enemy.scaleX;
        this.explosion.scaleY = enemy.scaleY;
        this.explosion.anims.play('explode').once('animationcomplete', () => {
            this.explosion.visible = false;
        }
        );
    }


    update() {
        this.tile.tilePositionY -= backgroundSpeed;
        this.tileCloudsTransparent.tilePositionY -= backgroundSpeed * 8;
        // This is called every frame
        if (pauseKey.isDown) {
            this.scene.launch('Pause');
            this.scene.pause();
        }
        if (cursors.up.isDown) {
            this.player.move('up');
        }
        if (cursors.down.isDown) {
            this.player.move('down');
        }
        if (cursors.left.isDown) {
            this.player.move('left');
        }
        if (cursors.right.isDown) {
            this.player.move('right');
        }

        if (pointer.isDown) {
            this.player.lookAt(pointer.x, pointer.y);
        }

        if (cursors.space.isDown) {
            this.player.accelerate();
        } else {
            this.player.decelerate();
        }

        if (fKey.isDown) {
            let rad = Math.DegToRad(this.player.angle);

            this.player.fireFromPlayer();
        }

        if (pointer.isDown) {
            this.player.fire(pointer.x, pointer.y, pointer.x, pointer.y);
        }
    }
}
