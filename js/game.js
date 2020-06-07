var Game = {};

Game.init = function () {
  game.stage.disableVisibilityChange = true;
};

Game.preload = function () {
  game.load.image("back", "assets/sprites/simple-map.png");
  game.load.image("sprite", "http://web-citizen.ru/hack/user.png");
};

Game.create = function () {
  game.stage.backgroundColor = "#262626";

  Game.playerMap = {};
  Game.avatars = {};
  Game.masks = {};
  Game.messages = {};
  Game.texts = {};

  Game.isCustom = false;
  var testKey = game.input.keyboard.addKey(Phaser.Keyboard.ENTER);
  testKey.onDown.add(Client.sendTest, this);

  var image = game.add.sprite(game.world.centerX, game.world.centerY, "back");
  // image.anchor.set(0.5);
  image.inputEnabled = true;
  image.events.onInputDown.add(Game.getCoordinates, this);

  Client.askNewPlayer();

  // event on click button
  document.querySelector(".inputField__send").addEventListener("click", () => {
    let text = document.querySelector(".inputField__input").value;
    if (text.slice(0, 4) == "http") {
      console.log("IMG LINK", text);
      Game.setAvatar(text);
    } else {
      console.log("Some message", text);
      Client.socket.emit("sendMessage", text);
    }
  });

  document.querySelector(".shareContacts").addEventListener("click", () => {
    document.querySelector(".shareContacts__result").style.display = "block";
  });
  game.world.setBounds(0, 0, 1920, 1920);
};

Game.getCoordinates = function (layer, pointer) {
  // send player coordinates
  Client.sendClick(pointer.worldX, pointer.worldY);
  let input = document.querySelector(".inputField__input");
  input.blur();
  document.querySelector(".userInfo").style.display = "none";
  game.camera.follow(Game.playerMap[Game.playerId]);
};

Game.addNewPlayer = function (id, x, y) {
  let image = game.add.sprite(x, y, "sprite");
  image.anchor.set(0.5);
  image.id = id;
  image.inputEnabled = true;
  image.events.onInputDown.add(Game.getUserData, this);
  Game.playerMap[id] = image;
  console.log("create user");
};

Game.loadCustomImage = function (id, url) {
  if (Game.avatars[id]) {
    Game.avatars[id].destroy();
    delete Game.avatars[id];
  }

  if (Game.isCustom) {
    // Game.playerMap[id].alpha = 0;
  }
  game.load.image(`avatar${id}`, url);
  game.load.start();
  console.log("Server execution", url);
};

Game.loadCustomMessage = function (id, message) {
  if (Game.texts[id]) {
    Game.texts[id].destroy();
    delete Game.texts[id];
  }
  Game.messages[id] = message;
  console.log("Get message", message);
};

Game.movePlayer = function (id, x, y, url) {
  console.log("move user ==", id);
  if (game.playerId == id) {
    game.camera.follow(Game.playerMap[id]);
  }
  var player = Game.playerMap[id];
  var distance = Phaser.Math.distance(player.x, player.y, x, y);
  var tween = game.add.tween(player);
  var duration = distance * 2;

  if (!Game.avatars[id]) {
    let image = game.add.image(player.x, player.y, `avatar${id}`);
    image.events.onInputDown.add(Game.getUserData, this);
    let mask = game.add.graphics(x, y);
    mask.beginFill(0xffffff);
    mask.drawCircle(120, 120, 120);
    image.mask = mask;
    mask.pivot.x = 120;
    mask.pivot.y = 120;
    mask.anchor.set(0.5);
    mask.alpha = 0;
    image.anchor.set(0.5);
    image.width = 120;
    image.height = 120;
    image.id = id;
    Game.masks[id] = mask;
    Game.avatars[id] = image;
  }
  if (Game.avatars[id]) {
    var avatar = Game.avatars[id];
    console.log(avatar);
    var tween_avatar = game.add.tween(avatar);
    tween_avatar.to({ x: x, y: y }, duration);
    tween_avatar.start();
  }

  if (!Game.texts[id] && Game.messages[id]) {
    let text = Game.messages[id];
    console.log("Some text", text);
    Game.texts[id] = game.add.text(x, y, text, {
      font: "bold 32px Arial",
      fill: "#fff",
    });
  } else {
    // if (Game.texts[id]) Game.texts[id].destroy();
  }

  if (Game.texts[id]) {
    var text = Game.texts[id];
    console.log("text", text);
    var tween_text = game.add.tween(text);
    tween_text.to({ x: x, y: y }, duration);
    tween_text.start();
  }

  if (Game.masks[id]) {
    var mask = Game.masks[id];
    var tween_mask = game.add.tween(mask);
    tween_mask.to({ x: x, y: y }, duration);
    tween_mask.start();
  }

  tween.to({ x: x, y: y }, duration);
  tween.start();
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
  game.player = player;
  console.log("set id");
};

Game.getUserData = function (image) {
  let bundle = {
    id: image.id,
    senderId: game.playerId,
  };
  console.log(bundle);
  Client.getUserById(bundle);
};
