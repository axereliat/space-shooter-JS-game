import config from '../config'

export class MedicineService {
  static initiateMedicine (game, medicineTime, medicines) {
    if (game.time.now > medicineTime) {
      const medicine = medicines.getFirstExists(false)

      medicine.reset(game.rnd.integerInRange(0, config.gameWidth), 0)
      medicine.body.velocity.y = 200
      medicine.scale.set(0.2, 0.2)

      return game.time.now + game.rnd.integerInRange(5000, 10000)
    }
    return medicineTime
  }
}
