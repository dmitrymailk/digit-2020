/*
 * Author: Jerome Renaux
 * E-mail: jerome.renaux@gmail.com
 */

var Game = {};

Game.init = function () {
  game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
  game.load.tilemap(
    "map",
    "assets/map/example_map.json",
    null,
    Phaser.Tilemap.TILED_JSON
  );
  game.load.spritesheet("tileset", "assets/map/tilesheet.png", 32, 32);
  game.load.image("sprite", "assets/sprites/sprite.png");
};

Game.create = function () {
  Game.playerMap = {};
  Game.avatars = {};
  var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  testKey.onDown.add(Client.sendTest, this);
  var map = game.add.tilemap("map");
  map.addTilesetImage("tilesheet", "tileset"); // tilesheet is the key of the tileset in map's JSON file
  var layer;
  for (var i = 0; i < map.layers.length; i++) {
    layer = map.createLayer(i);
  }
  layer.inputEnabled = true; // Allows clicking on the map ; it's enough to do it on the last layer
  //   listener on field clicks
  layer.events.onInputUp.add(Game.getCoordinates, this);
  Client.askNewPlayer();

  // event on click button
  document.getElementById("avatarButton").addEventListener("click", () => {
    let imgLink = document.getElementById("avatarUrl").value;
    Game.setAvatar(imgLink);
  });
};

Game.getCoordinates = function (layer, pointer) {
  // send player coordinates
  Client.sendClick(pointer.worldX, pointer.worldY);
};

Game.addNewPlayer = function (id, x, y) {
  Game.playerMap[id] = game.add.sprite(x, y, "sprite");
};

Game.loadCustomImage = function (id, url) {
  game.cache.removeImage(`avatar${id}`, true);
  //   delete game.cache._cache.image[`avatar${id}`];
  if (Game.avatars[id]) {
    Game.avatars[id].destroy();
    delete Game.avatars[id];
  }
  game.load.image(`avatar${id}`, url);
  console.log(game.cache._cache);
  game.load.start();
  console.log("Server execution", url);
};
// http://web-citizen.ru/hack/person_big.png
// http://web-citizen.ru/hack/user.png
Game.movePlayer = function (id, x, y, url) {
  console.log("Move");
  //   game.cache.removeImage(`avatar${id}`, true);
  var player = Game.playerMap[id];
  var distance = Phaser.Math.distance(player.x, player.y, x, y);
  var tween = game.add.tween(player);
  var duration = distance * 2;

  if (!Game.avatars[id]) {
    Game.avatars[id] = game.add.image(player.x, player.y, `avatar${id}`);
  }

  console.log("Avatar from server", url);
  var avatar = Game.avatars[id];
  var tween_avatar = game.add.tween(avatar);
  let avatar_offset = 12;
  tween.to({ x: x, y: y }, duration);
  tween.start();
  tween_avatar.to({ x: x + avatar_offset, y: y + avatar_offset }, duration);
  tween_avatar.start();
};

Game.setAvatar = function (url) {
  //   url = "http://web-citizen.ru/hack/person_big.png";
  //   game.load.image("avatar", url);
  console.log("Send to server url", url);
  Client.setAvatar(url);
};

Game.removePlayer = function (id) {
  Game.playerMap[id].destroy();
  Game.avatars[id].destroy();
  delete Game.playerMap[id];
  delete Game.avatars[id];
};
