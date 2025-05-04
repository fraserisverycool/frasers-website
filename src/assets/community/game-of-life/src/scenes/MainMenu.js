import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.tile = this.add.tileSprite(0, 0 , 0 , 0, 'bg-hearth');
        this.scaleTileX = this.scale.width / this.tile.width ;
        this.scaleTileY = this.scale.height/ this.tile.height;
        this.tile.scaleX = this.scaleTileX;
        this.tile.scaleY = this.scaleTileY;
        this.tile.setOrigin(0, 0);

        this.add.text(512, 300, 'Super Shooter', {
            fontFamily: 'Arial Black', fontSize: 70, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 460, 'click to start', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}
