/* globals __DEV__ */
import Phaser from 'phaser'
import Player from '../sprites/Player'
import {AmmoService} from '../services/AmmoService'
import {MedicineService} from '../services/MedicineService'
import {AsteroidService} from '../services/AsteroidService'

export default class extends Phaser.State {
  init () {
  }

  preload () {
  }

  create () {
    this.game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT

    this.powerupAudio = this.game.add.audio('powerup')
    this.painAudio = this.game.add.audio('pain')
    this.shotAudio = this.game.add.audio('shot')
    this.destroyAudio = this.game.add.audio('destroy')

    this.lives = 5
    this.score = 0
    this.minAsteroidLives = 1
    this.maxAsteroidLives = 3

    this.background = this.game.add.tileSprite(0, 0, 800, 600, 'background')
    this.player = new Player({
      game: this.game,
      x: this.world.centerX,
      y: this.world.bounds.bottom - 30,
      asset: 'player'
    })
    this.game.physics.arcade.enable(this.player)
    this.player.physicsType = Phaser.Physics.ARCADE

    this.fireRate = 350
    this.bulletTime = 0
    this.bullets = this.game.add.group()
    this.bullets.enableBody = true
    this.bullets.physicsBodyType = Phaser.Physics.ARCADE
    this.bullets.createMultiple(50, 'bullet')
    this.bullets.setAll('anchor.x', 0.5)
    this.bullets.setAll('anchor.y', 1)
    this.bullets.setAll('outOfBoundsKill', true)
    this.bullets.setAll('checkWorldBounds', true)

    this.maxMiliSecondsAsteroids = 800
    this.asteroidTime = 200
    this.asteroids = this.game.add.group()
    this.asteroids.enableBody = true
    this.asteroids.physicsBodyType = Phaser.Physics.ARCADE
    this.asteroids.createMultiple(50, 'asteroid')
    this.asteroids.setAll('anchor.x', 0.5)
    this.asteroids.setAll('anchor.y', 1)
    this.asteroids.setAll('outOfBoundsKill', true)
    this.asteroids.setAll('checkWorldBounds', true)

    this.medicineTime = 200
    this.medicines = this.game.add.group()
    this.medicines.enableBody = true
    this.medicines.physicsBodyType = Phaser.Physics.ARCADE
    this.medicines.createMultiple(50, 'medicine')
    this.medicines.setAll('anchor.x', 0.5)
    this.medicines.setAll('anchor.y', 1)
    this.medicines.setAll('outOfBoundsKill', true)
    this.medicines.setAll('checkWorldBounds', true)

    this.ammoBagTime = 7000
    this.ammoBags = this.game.add.group()
    this.ammoBags.enableBody = true
    this.ammoBags.physicsBodyType = Phaser.Physics.ARCADE
    this.ammoBags.createMultiple(50, 'ammo')
    this.ammoBags.setAll('anchor.x', 0.5)
    this.ammoBags.setAll('anchor.y', 1)
    this.ammoBags.setAll('outOfBoundsKill', true)
    this.ammoBags.setAll('checkWorldBounds', true)

    this.explosions = this.game.add.group()
    this.explosions.createMultiple(30, 'explosion')

    this.player.scale.set(0.2, 0.2)
    this.game.add.existing(this.player)
    this.fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

    this.scoreString = 'Score: '
    this.scoreText = this.game.add.text(10, 10, this.scoreString + this.score, {
      font: '34px Times New Roman',
      fill: '#fff'
    })

    this.livesString = 'Lives: '
    this.livesText = this.game.add.text(10, 90, this.livesString + this.lives, {
      font: '34px Times New Roman',
      fill: '#fff'
    })

    this.highScoreString = 'High Score: '
    this.highScoreText = this.game.add.text(10, 50, this.highScoreString + (localStorage.getItem('score') | 0), {
      font: '34px Times New Roman',
      fill: '#fff'
    })

    this.game.input.onDown.add(this.gofull, this)
  }

  gofull () {
    if (this.game.scale.isFullScreen) {
      this.game.scale.stopFullScreen()
    } else {
      this.game.scale.startFullScreen(false)
    }
  }

  update () {
    if (this.fireButton.isDown) {
      this.fireBullet()
    }
    this.asteroidTime = AsteroidService.initiateAsteroid(
      this.game,
      this.asteroidTime,
      this.asteroids,
      this.minAsteroidLives,
      this.maxAsteroidLives,
      this.player,
      this.maxMiliSecondsAsteroids)

    if (this.lives < 3) {
      this.medicineTime = MedicineService.initiateMedicine(this.game, this.medicineTime, this.medicines)
    }
    this.ammoBagTime = AmmoService.initiateAmmo(this.game, this.ammoBagTime, this.ammoBags)

    this.increaseAsteroids()

    this.game.physics.arcade.overlap(this.bullets, this.asteroids, this.bulletAndAsteroidCollisionHandler, null, this)
    this.game.physics.arcade.overlap(this.asteroids, this.player, this.asteroidAndPlayerCollisionHandler, null, this)
    this.game.physics.arcade.overlap(this.medicines, this.player, this.medicineAndPlayerCollisionHandler, null, this)
    this.game.physics.arcade.overlap(this.ammoBags, this.player, this.ammoAndPlayerCollisionHandler, null, this)
  }

  ammoAndPlayerCollisionHandler (player, ammoBag) {
    ammoBag.kill()
    this.powerupAudio.play()

    this.fireRate = 100
    setTimeout(() => {
      this.fireRate = 350
    }, 4000)
  }

  increaseAsteroids () {
    if (this.score > 7) {
      this.maxMiliSecondsAsteroids = 700
    }
    if (this.score > 14) {
      this.maxMiliSecondsAsteroids = 400
    }
    if (this.score > 30) {
      this.maxMiliSecondsAsteroids = 300
    }
  }

  medicineAndPlayerCollisionHandler (player, medicine) {
    medicine.kill()
    this.powerupAudio.play()
    this.lives += 5
    this.livesText.text = this.livesString + this.lives
  }

  asteroidAndPlayerCollisionHandler (player, asteroid) {
    asteroid.kill()
    this.lives--
    this.livesText.text = this.livesString + this.lives
    this.destroyAudio.play()
    this.painAudio.play()
    if (this.lives <= 0) {
      this.game.scale.stopFullScreen()
      this.state.start('GameOver', true, false, {score: this.score})
      return
    }

    const explosion = this.explosions.getFirstExists(false)
    explosion.scale.set(1.2, 1.2)
    this.player.sendToBack()
    this.background.sendToBack()
    explosion.reset(player.body.x - 50, player.body.y - 60)
    explosion.animations.add('explode', [0, 1, 2, 3, 4, 5], false)
    explosion.play('explode', 30, false, true)
  }

  bulletAndAsteroidCollisionHandler (bullet, asteroid) {
    bullet.kill()

    asteroid.lives--
    if (asteroid.lives <= 0) {
      this.destroyAudio.play()
      asteroid.kill()
      this.score++
      this.scoreText.text = this.scoreString + this.score
    }

    const explosion = this.explosions.getFirstExists(false)
    asteroid.sendToBack()
    this.background.sendToBack()
    explosion.reset(asteroid.body.x, asteroid.body.y)
    explosion.animations.add('explode', [0, 1, 2, 3, 4, 5], false)
    explosion.play('explode', 30, false, true)
  }
  /*
  initiateAsteroid () {
    if (this.game.time.now > this.asteroidTime) {
      const asteroid = this.asteroids.getFirstExists(false)

      asteroid.reset(this.game.rnd.integerInRange(0, config.gameWidth), 0)
      const size = this.game.rnd.realInRange(0.3, 0.7)
      asteroid.scale.set(size, size)
      asteroid.lives = this.game.rnd.integerInRange(this.minAsteroidLives, this.maxAsteroidLives)
      const rnd = this.game.rnd.integerInRange(1, 3)
      if (rnd !== 3) {
        asteroid.body.velocity.y = 300
      } else {
        this.game.physics.arcade.moveToObject(asteroid, this.player, 120)
      }
      this.asteroidTime = this.game.time.now + this.game.rnd.integerInRange(300, this.maxMiliSecondsAsteroids)
    }
  } */

  fireBullet () {
    const bulletArr = []
    this.bullets.forEachDead(bullet => {
      bulletArr.push(bullet)
    })
    const bullet1 = bulletArr[0]
    const bullet2 = bulletArr[1]
    const bullet3 = bulletArr[2]
    if (bullet1 && bullet2 && bullet3) {
      if (this.game.time.now > this.bulletTime) {
        this.shotAudio.play()
        bullet1.reset(this.player.x, this.player.y - 15)
        bullet1.body.velocity.y = -400
        bullet1.angle = 0
        if (this.fireRate !== 350) {
          bullet2.reset(this.player.x, this.player.y - 15)
          bullet2.body.velocity.y = -400
          bullet2.body.velocity.x = -200
          bullet2.angle = -20
          bullet3.reset(this.player.x, this.player.y - 15)
          bullet3.body.velocity.y = -400
          bullet3.body.velocity.x = 200
          bullet3.angle = 20
        }
        this.bulletTime = this.game.time.now + this.fireRate
      }
    }
  }

  render () {
    if (__DEV__) {
      // this.game.debug.spriteInfo(this.player, 32, 32)
    }
  }
}
