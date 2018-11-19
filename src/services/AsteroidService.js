import config from '../config'

export class AsteroidService {
  static initiateAsteroid (game, asteroidTime, asteroids, minAsteroidLives, maxAsteroidLives, player, maxMiliSecondsAsteroids) {
    if (game.time.now > asteroidTime) {
      const asteroid = asteroids.getFirstExists(false)

      asteroid.reset(game.rnd.integerInRange(0, config.gameWidth), 0)
      const size = game.rnd.realInRange(0.3, 0.7)
      asteroid.scale.set(size, size)
      asteroid.lives = game.rnd.integerInRange(minAsteroidLives, maxAsteroidLives)
      const rnd = game.rnd.integerInRange(1, 3)
      if (rnd !== 3) {
        asteroid.body.velocity.y = 300
      } else {
        game.physics.arcade.moveToObject(asteroid, player, 120)
      }
      return game.time.now + game.rnd.integerInRange(300, maxMiliSecondsAsteroids)
    }
    return asteroidTime
  }
}
