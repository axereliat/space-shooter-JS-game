import config from '../config'

export class AmmoService {
  static initiateAmmo (game, ammoBagTime, ammoBags) {
    if (game.time.now > ammoBagTime) {
      const ammo = ammoBags.getFirstExists(false)

      ammo.reset(game.rnd.integerInRange(0, config.gameWidth), 0)
      ammo.body.velocity.y = 200
      ammo.scale.set(0.4, 0.4)

      return game.time.now + game.rnd.integerInRange(18000, 22000)
    }
    return ammoBagTime
  }
}
