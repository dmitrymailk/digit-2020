/**
 * Created by Jerome on 03-03-17.
 */

var Client = {};
Client.socket = io.connect();

Client.sendTest = function () {
  console.log("test sent");
  Client.socket.emit("test");
};

Client.askNewPlayer = function () {
  Client.socket.emit("newplayer");
};

Client.sendClick = function (x, y) {
  Client.socket.emit("click", { x: x, y: y });
};

Client.setAvatar = function (url) {
  Client.socket.emit("setAvatar", url);
};

Client.socket.on("newplayer", function (data) {
  Game.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on("loadCustomImage", function (data) {
  Game.loadCustomImage(data.id, data.avatar);
});

Client.socket.on("allplayers", function (data) {
  for (var i = 0; i < data.length; i++) {
    Game.addNewPlayer(data[i].id, data[i].x, data[i].y);
    // if()
    Game.loadCustomImage(data[i].id, data[i].avatar);
  }

  Client.socket.on("move", function (data) {
    Game.movePlayer(data.id, data.x, data.y, data.avatar);
  });

  Client.socket.on("remove", function (id) {
    Game.removePlayer(id);
  });
});
