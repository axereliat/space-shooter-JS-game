import Phaser from 'phaser'

export default class extends Phaser.State {
  init (payload) {
    this.score = +payload.score

    this.stage.backgroundColor = '#000000'
  }

  preload () {
    console.log('in preload')
    const highScore = +localStorage.getItem('score')
    const username = localStorage.getItem('username') || 'Anonymous'

    if (this.score > highScore) {
      localStorage.setItem('score', this.score)
      window.updateHighScore(username, this.score)
    }

    const gameOverText = this.game.add.text(this.world.centerX, this.world.centerY - 140, 'Game Over', { font: '64px Arial', fill: 'red', align: 'center' })
    gameOverText.anchor.setTo(0.5, 0.5)
    const scoreText = this.game.add.text(this.world.centerX, this.world.centerY - 80, `You scored ${this.score} points. Good job!`, { font: '32px Arial', fill: '#dddddd', align: 'center' })
    scoreText.anchor.setTo(0.5, 0.5)
    const highscoreText = this.game.add.text(this.world.centerX, this.world.centerY - 30, `High score: ${localStorage.getItem('score') | 0}`, { font: '32px Arial', fill: '#dddddd', align: 'center' })
    highscoreText.anchor.setTo(0.5, 0.5)
    this.game.add.button(this.game.world.centerX - 120, this.world.centerY + 10, 'leaderboardBtn', () => {
      window.fetchScores()
      $('#leaderboard').modal('show')
    }, this, 2, 1, 0)
    this.game.add.button(this.game.world.centerX - 120, this.world.centerY + 100, 'retryBtn', () => {
      this.state.start('Game')
    }, this, 2, 1, 0)
  }

  create () {
  }
}
