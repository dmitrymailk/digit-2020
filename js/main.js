let width = document.body.clientWidth;
let height = document.body.clientHeight;

var game = new Phaser.Game(
  width,
  height,
  Phaser.CANVAS,
  document.getElementById("game")
);
game.state.add("Game", Game);
game.state.start("Game");
