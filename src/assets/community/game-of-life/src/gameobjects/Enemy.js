import { Physics, Math } from "phaser";
import { EventBus } from '../EventBus.js';
const pointValue = 10;
const speed = 3;
const initialHealth = 100;

export class Enemy extends Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy-big', 0);
        const randomeScale = Math.Between(1, 3);
        this.scale = randomeScale;
        this.setScale(randomeScale);
        scene.add.existing(this);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.texture = 'enemy';
        this.player = this.scene.player;
        
        
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDrag(100);
        this.health = initialHealth;

        this.anims.create({
            key: 'idle',
            frames: this.anims.generateFrameNumbers('enemy-big', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });
        
        this.anims.play('idle');
        this.explosion = this.scene.add.sprite(this.x, this.y, 'explosion')
        this.explosion.setScale(this.scaleX, this.scaleY);
        this.explosion.visible = false;
        this.explosion.anims.create({
            key: 'death',
            frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 4 }),
            frameRate: 20,
            repeat: 1
        })         
    }


    die() {
        this.scene.enemyExploded(this)
        this.destroy();
        EventBus.emit('EnemyDied', this);
    }

    pointValue() {
        return pointValue;
    }
    
    shake() {
        this.scene.tweens.add({
            targets: this,
            repeat: 5,
            duration: 50,
            x: this.x + Math.Between(-5, 5),  // Shake effect
            yoyo: true,
            onRepeat: () => {
                if (this.tintTopLeft === 0xffffff) {
                    this.setTint(0xff0000);
                } else {
                    this.clearTint();
                }
            },
            onComplete: () => {
                this.clearTint();
            }   
        });
    }

    takeDamage(amount) {
        this.health -= amount;
        if (this.health <= 0) {
            this.die();  // Remove enemy from the scene when health is 0
        } else {
            this.shake();
        }
    }

    update(time, delta) {
        // Move towards the player
        this.end_direction = new Math.Vector2(this.player.x - this.x, this.player.y - this.y ).normalize();
        this.x += speed * this.end_direction.x;
        this.y += speed * this.end_direction.y;
        this.rotation = Math.Angle.Between(this.x, this.y, this.player.x, this.player.y);
    }

}