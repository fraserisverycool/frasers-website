import { Physics, Math } from "phaser";

const speed = 1;
const damage = 30;
export class Bullet extends Physics.Arcade.Sprite 
{   
    end_direction = new Math.Vector2(0, 0);

    constructor(scene, x, y) {
        super(scene, x, y, 'bullet');
        scene.add.existing(this);
        this.scene = scene;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.texture = 'bullet';
        this.name = "bullet";
        this.damage = damage;
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDrag(100);
        this.setScale(1);

        this.anims.create({
            key: 'idle-bullet',
            frames: this.anims.generateFrameNumbers('bullet', { start: 0, end: 1 }),
            frameRate: 5,
            repeat: -1
        });

        this.anims.play('idle-bullet');
    }

    fire({ x, y, targetX, targetY, angle }) 
    {
        this.x = x;
        this.y = y;
        this.end_direction = new Math.Vector2(targetX - x, targetY - y ).normalize();
        // Calculate direction towards target
        
    }

    update(time, delta)
    {
        this.x += speed * this.end_direction.x * delta;
        this.y += speed * this.end_direction.y * delta;

        if (this.x > this.scene.sys.canvas.width || this.x < 0 || this.y > this.scene.sys.canvas.height || this.y < 0) {
            this.setActive(false);
            this.setVisible(false);
            this.destroy();
        }
    }
}