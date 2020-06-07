var express = require("express");
var app = express();
var cors = require("cors");
var server = require("http").Server(app);
var io = require("socket.io").listen(server);

app.use(cors());

app.use("/css", express.static(__dirname + "/css"));
app.use("/js", express.static(__dirname + "/js"));
app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

server.lastPlayderID = 0;

server.listen(process.env.PORT || 8081, function () {
  console.log("Listening on " + server.address().port);
  console.log("http://localhost:" + server.address().port);
});

io.on("connection", function (socket) {
  socket.on("newplayer", function () {
    socket.player = {
      id: server.lastPlayderID++,
      x: randomInt(100, 400),
      y: randomInt(100, 400),
      avatar: "",
      hobby: "Занимаюсь всяким",
      nickname: "John Smith",
      job: "Game dev dev",
      random: Date(),
      status: "Ищу собеседника и ещё",
      lastMessage: "",
    };
    socket.emit("allplayers", getAllPlayers());
    socket.broadcast.emit("newplayer", socket.player);
    socket.emit("returnPlayer", socket.player);

    socket.on("click", function (data) {
      console.log("player ", socket.player);
      socket.player.x = data.x;
      socket.player.y = data.y;
      io.emit("move", socket.player);
    });

    socket.on("setAvatar", function (url) {
      console.log("Url Avatar from client", url);
      socket.player.avatar = url;
      io.emit("loadCustomImage", socket.player);
    });

    socket.on("getUserById", function (bundle) {
      console.log("User id ", bundle.id);
      let result = {
        user: getPlayerById(bundle.id)[0],
        senderId: bundle.senderId,
      };
      io.emit("getUserById", result);
    });

    socket.on("sendMessage", function (text) {
      console.log("User message", text);
      socket.player.lastMessage = text;
      io.emit("loadCustomMessage", socket.player);
    });

    socket.on("disconnect", function () {
      io.emit("remove", socket.player.id);
    });
  });

  socket.on("test", function () {
    console.log("test received", getAllPlayers());
  });
});

function getAllPlayers() {
  var players = [];
  Object.keys(io.sockets.connected).forEach(function (socketID) {
    var player = io.sockets.connected[socketID].player;
    if (player) players.push(player);
  });
  return players;
}
function getPlayerById(id) {
  var players = [];
  Object.keys(io.sockets.connected).forEach(function (socketID) {
    var player = io.sockets.connected[socketID].player;
    if (player && player.id == id) players.push(player);
  });
  return players;
}

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}
