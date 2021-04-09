//@ts-check
class mainScreen extends Phaser.Scene {

  /** Load assets into RAM */
  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  /** Create and initialize scene components */
  create() {

    // Initialize instance variables
    this.gameOver = false;
    this.score = 0;
    this.cursors = this.input.keyboard.createCursorKeys();

    this.createBackground();
    this.createPlatforms();
    this.createPlayer();
    this.createStars();
    this.createBombs();
    this.setColliders();
  }

  /** runs in a loop, used to check for input changes */
  update() {

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);

    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);

    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-500);
      this.sound.play("jumpSound");
    }
  }

  createBackground() {
    this.backgroundImage = this.add.image(400, 300, "sky");
    this.scoreText = this.add.text(16,
      16,
      'score: 0',
      { fontSize: '32px', color: 'white' });
  }

  /** initialize the platforms */
  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(2).refreshBody();

    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");
  }

  /** initialize the player */
  createPlayer() {
    this.player = this.physics.add.sprite(100, 450, "dude");
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }

  /** initialize the bombs */
  createBombs() {
    this.bombs = this.physics.add.group();
  }

  /** initialize the stars */
  createStars() {
    this.stars = this.physics.add.group({
      classType: Phaser.Physics.Arcade.Image,
      key: "star",
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 },
    });

    this.stars.children.iterate(
      /**
      * Give each star a random bounce amount
      * @param {Phaser.Physics.Arcade.Image} star 
      */
      function (star) {
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
      }
    );
  }

  /** set all physics colliders */
  setColliders() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, this.endGame, null, this);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);
  }

  /**
   * Ends the game when the player hits a bomb
   * @param {Phaser.Physics.Arcade.Sprite} player 
   * @param {Phaser.Physics.Arcade.Image} bomb 
   */
  endGame(player, bomb) {
    this.physics.pause();
    player.setTint(0xFF0000);
    player.anims.play('turn');
    this.gameOver = true;
  }


  /**
   * Collects the stars
   * @param {Phaser.Physics.Arcade.Sprite} player 
   * @param {Phaser.Physics.Arcade.Image} star 
   */
  collectStar(player, star) {
    star.disableBody(true, true);
    this.score += 10;
    this.scoreText.setText("Score: " + this.score);
    if (this.stars.countActive(true) === 0) {
      this.nextLevel();
    }
  }

  /**
   * Move to next level by resetting stars and adding a new bomb
   */
  nextLevel() {
    // show all the stars again
    this.stars.children.iterate(
      /**
       * Make each star visible again
       * @param {Phaser.Physics.Arcade.Image} star 
       */
      function (star) {
        star.enableBody(true, star.x, 0, true, true);
      }
    );

    // add a new bomb
    var x;
    if (this.player.x < 400) {
      x = Phaser.Math.Between(400, 800);
    } else {
      x = Phaser.Math.Between(0, 400);
    }

    var bomb = this.physics.add.image(x, 0, "bomb");
    this.bombs.add(bomb);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }

} //end scene class

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 600 },
      debug: false,
    },
  },
  scene: mainScreen
};

var game = new Phaser.Game(config);