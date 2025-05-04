import { Scene } from 'phaser';

export class Pause extends Scene {

  constructor ()
    {
      super('Pause');
    }

  create(){
    let pauseKey = this.input.keyboard.addKey('ESC');
    this.add.text(512, 384, 'PAUSED', {
      fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
      stroke: '#000000', strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);
    pauseKey.on('down', () => {
      this.scene.resume('Game');
      this.scene.stop('Pause');
    });

  }
}
