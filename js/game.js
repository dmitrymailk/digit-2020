var Game = {};

Game.init = function () {
  game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
  game.load.image("back", "assets/sprites/simple-map.png");
  game.load.image("sprite", "assets/sprites/photo.png");
};

Game.create = function () {
  game.stage.backgroundColor = "#262626";

  Game.playerMap = {};
  Game.avatars = {};
  Game.masks = {};
  Game.isCustom = false;
  var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  testKey.onDown.add(Client.sendTest, this);

  var image = game.add.sprite(game.world.centerX, game.world.centerY, "back");
  // image.anchor.set(0.5);
  image.inputEnabled = true;
  image.events.onInputDown.add(Game.getCoordinates, this);

  Client.askNewPlayer();

  // event on click button
  document.getElementById("avatarButton").addEventListener("click", () => {
    let imgLink = document.getElementById("avatarUrl").value;
    Game.setAvatar(imgLink);
  });
  game.world.setBounds(0, 0, 1920, 1920);
};

Game.getCoordinates = function (layer, pointer) {
  // send player coordinates
  Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.addNewPlayer = function (id, x, y) {
  let image = game.add.sprite(x, y, "sprite");
  mask = game.add.graphics(x, y);
  mask.beginFill(0xffffff);
  mask.drawCircle(120, 120, 120);
  image.mask = mask;
  mask.pivot.x = 120;
  mask.pivot.y = 120;
  mask.anchor.set(0.5);
  mask.alpha = 0;
  image.anchor.set(0.5);
  Game.playerMap[id] = image;
  Game.masks[id] = mask;
  // game.camera.follow(Game.playerMap[id]);
};

Game.loadCustomImage = function (id, url) {
  if (Game.avatars[id]) {
    Game.avatars[id].destroy();
    delete Game.avatars[id];
  }

  if (Game.isCustom) {
    Game.playerMap[id].alpha = 0;
  }
  game.load.image(`avatar${id}`, url);
  game.load.start();
  console.log("Server execution", url);
};
// http://web-citizen.ru/hack/person_big.png
// http://web-citizen.ru/hack/user.png
Game.movePlayer = function (id, x, y, url) {
  console.log("move user ==", id);
  if (game.playerId == id) {
    console.log("user ==", id);
    game.camera.follow(Game.playerMap[id]);
  }
  var player = Game.playerMap[id];
  var distance = Phaser.Math.distance(player.x, player.y, x, y);
  var tween = game.add.tween(player);
  var duration = distance * 2;

  if (!Game.avatars[id]) {
    let image = game.add.image(player.x, player.y, `avatar${id}`);
    mask = game.add.graphics(x, y);
    mask.beginFill(0xffffff);
    mask.drawCircle(120, 120, 120);
    image.mask = mask;
    mask.pivot.x = 120;
    mask.pivot.y = 120;
    mask.anchor.set(0.5);
    mask.alpha = 0;
    image.anchor.set(0.5);
    Game.masks[id] = mask;
    Game.avatars[id] = image;
  }
  var avatar = Game.avatars[id];
  var tween_avatar = game.add.tween(avatar);

  var mask = Game.masks[id];
  var tween_mask = game.add.tween(mask);

  tween.to({ x: x, y: y }, duration);
  tween.start();
  tween_avatar.to({ x: x, y: y }, duration);
  tween_avatar.start();
  tween_mask.to({ x: x, y: y }, duration);
  tween_mask.start();
};

Game.setAvatar = function (url) {
  console.log("Send to server url", url);
  Game.isCustom = true;
  Client.setAvatar(url);
};

Game.removePlayer = function (id) {
  Game.playerMap[id].destroy();
  Game.avatars[id].destroy();
  delete Game.playerMap[id];
  delete Game.avatars[id];
};

Game.setPlayerData = function (player) {
  game.playerId = player.id;
};
