import * as Phaser from 'phaser';

// --- 敵クラス (クリボー風) ---
class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'enemy');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setTint(0xffaa00);
    this.setVelocityX(-100);
    this.setCollideWorldBounds(true);
  }

  update() {
    if (this.body.blocked.left) this.setVelocityX(100);
    else if (this.body.blocked.right) this.setVelocityX(-100);
  }
}

// --- ボスクラス ---
class Boss extends Phaser.Physics.Arcade.Sprite {
  public hp = 3;
  public isInvincible = false; // 外部から参照できるようにpublicに

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'boss');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setScale(2).setTint(0xff0000).setCollideWorldBounds(true);
  }

  takeDamage() {
    if (this.isInvincible) return;
    this.hp--;
    this.isInvincible = true; // ← ここをtrueに修正

    this.scene.tweens.add({
      targets: this,
      alpha: 0.2,
      duration: 100,
      yoyo: true,
      repeat: 5, // 点滅回数を増やして無敵時間を確保
      onComplete: () => {
        this.isInvincible = false;
        this.alpha = 1;
      }
    });

    if (this.hp <= 0) {
      this.setCollideWorldBounds(false);
      this.setVelocity(200, -600);
      this.setAngularVelocity(500);
    }
  }
}

// --- 各シーンの実装 ---
class TitleScene extends Phaser.Scene {
  constructor() { super('TitleScene'); }
  create() {
    this.add.text(400, 200, 'SUPER TS MARIO', { fontSize: '48px' }).setOrigin(0.5);
    this.add.text(400, 400, 'CLICK TO START', { fontSize: '24px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('GameScene'));
  }
}

class GameScene extends Phaser.Scene {
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private enemies!: Phaser.Physics.Arcade.Group;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private killedCount = 0;
  private isClearing = false;

  constructor() { super('GameScene'); }

  preload() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    const createTex = (key: string, color: number) => {
      graphics.clear();
      graphics.fillStyle(color, 1);
      graphics.fillRect(0, 0, 32, 32);
      graphics.generateTexture(key, 32, 32);
    };
    createTex('ground', 0x888888);
    createTex('player', 0x00ff00);
    createTex('enemy', 0xffaa00);
    createTex('boss', 0xff0000);
    createTex('flag', 0xffff00);
  }

  create() {
    this.killedCount = 0;
    this.isClearing = false;

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, 'ground').setScale(25, 1).refreshBody();
    this.platforms.create(600, 400, 'ground').setScale(5, 1).refreshBody();

    this.player = this.physics.add.sprite(100, 450, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(20, 32, true); // 当たり判定を少しスリムに
    this.physics.add.collider(this.player, this.platforms);

    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    this.enemies.get(400, 500);
    this.enemies.get(500, 500);
    this.enemies.get(700, 500);
    this.physics.add.collider(this.enemies, this.platforms);

    // 雑魚敵との衝突判定 (Overlap方式)
    this.physics.add.overlap(this.player, this.enemies, (p, e) => {
      const player = p as Phaser.Physics.Arcade.Sprite;
      const enemy = e as Enemy;
      if (player.body.velocity.y > 0) {
        enemy.destroy();
        player.setVelocityY(-400);
        this.killedCount++;
        if (this.killedCount === 3) this.spawnBoss();
      } else {
        if (player.y > enemy.y - 15) this.scene.start('GameOverScene');
      }
    });

    const goal = this.physics.add.staticSprite(750, 500, 'flag').setVisible(false);
    this.physics.add.overlap(this.player, goal, () => {
      if (goal.visible && !this.isClearing) {
        this.isClearing = true;
        this.player.setVelocity(0, 0);
        this.add.text(400, 300, 'GOAL!', { fontSize: '64px' }).setOrigin(0.5);
        this.time.delayedCall(2000, () => this.scene.start('GameClearScene'));
      }
    });

    this.events.on('boss_defeated', () => goal.setVisible(true));
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  spawnBoss() {
    const boss = new Boss(this, 400, 100);
    this.physics.add.collider(boss, this.platforms);
  
    // colliderではなくoverlapで「重なり」を検知
    this.physics.add.overlap(this.player, boss, (p, b) => {
      const player = p as Phaser.Physics.Arcade.Sprite;
      const bossObj = b as Boss;
  
      // 無敵時間中は何もしない（重なってもOK）
      if (bossObj.isInvincible) return;
  
      // 【重要】落下中なら、どこに当たっても「踏んだ」とみなす
      // これにより「踏んだ直後のミス」を物理的に回避します
      if (player.body.velocity.y > 0) {
        bossObj.takeDamage();
        player.setVelocityY(-500); // 強めに跳ね返す（ボスから引き離す）
        
        if (bossObj.hp <= 0) {
          this.events.emit('boss_defeated');
        }
      } else {
        // 落下中以外（ジャンプ中や地上）で触れたらミス
        this.scene.start('GameOverScene');
      }
    });
  }

  update() {
    if (this.isClearing) return;
    if (this.cursors.left.isDown) this.player.setVelocityX(-220);
    else if (this.cursors.right.isDown) this.player.setVelocityX(220);
    else this.player.setVelocityX(0);

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-480);
    }
  }
}

class ResultScene extends Phaser.Scene {
  constructor(key: string, private msg: string) { super(key); }
  create() {
    this.add.text(400, 300, this.msg, { fontSize: '48px' }).setOrigin(0.5);
    this.add.text(400, 400, 'CLICK TO TITLE', { fontSize: '24px' }).setOrigin(0.5);
    this.input.once('pointerdown', () => this.scene.start('TitleScene'));
  }
}

class GameClearScene extends ResultScene { constructor() { super('GameClearScene', 'GAME CLEAR!'); } }
class GameOverScene extends ResultScene { constructor() { super('GameOverScene', 'GAME OVER'); } }

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800, height: 600,
  physics: { default: 'arcade', arcade: { gravity: { y: 900 } } },
  scene: [TitleScene, GameScene, GameClearScene, GameOverScene]
};

new Phaser.Game(config);