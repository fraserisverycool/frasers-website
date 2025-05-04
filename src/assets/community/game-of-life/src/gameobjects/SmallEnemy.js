import { Physics, Math } from "phaser";
import { Enemy } from "./Enemy.js";

export class SmallEnemy extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, 'enemy-small', 0);
        scene.add.existing(this);
        this.scene = scene;
        this.player = scene.player;
        this.scene.add.existing(this);
        this.scene.physics.add.existing(this);
        this.texture ='enemy-small';
        const randomeScale = Math.Between(1, 3);
        this.scale = randomeScale;
        this.setScale(randomeScale);
        this.setCollideWorldBounds(true);
        this.setBounce(0);
        this.setDrag(100);
        this.health = 100;
    }

}