import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    init(data) {
        this.cameras.main.fadeIn(1000, 0, 0, 0);
        this.end_score = data.score || 0;
    }

    create ()
    {
        this.tile = this.add.tileSprite(0, 0 , 0 , 0, 'bg-hearth');
        this.scaleTileX = this.scale.width / this.tile.width ;
        this.scaleTileY = this.scale.height/ this.tile.height;
        this.tile.tintTopLeft = 0xff0000;
        this.tile.tintTopRight = 0x00ff00;
        this.tile.scaleX = this.scaleTileX;
        this.tile.scaleY = this.scaleTileY;
        this.tile.setOrigin(0, 0);

        this.add.text(512, 384, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.add.text(512, 460, `Score: ${this.end_score}`, {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        this.input.once('pointerdown', () => {

            this.scene.start('MainMenu');

        });
    }
}
