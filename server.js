const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const rooms = {};
const games = {};

function createDeck() {
  const palos = ["Espada", "Basto", "Oro", "Copa"];
  const numeros = [1,2,3,4,5,6,7,10,11,12];
  let deck = [];
  palos.forEach(p => {
    numeros.forEach(n => deck.push(`${n} ${p}`));
  });
  return deck.sort(() => Math.random() - 0.5);
}

function getValor(card) {
  const ranking = {
    "1 Espada": 14,
    "1 Basto": 13,
    "7 Espada": 12,
    "7 Oro": 11
  };
  if (ranking[card]) return ranking[card];
  const num = parseInt(card.split(" ")[0]);
  if (num === 3) return 10;
  if (num === 2) return 9;
  if (num === 1) return 8;
  if (num === 12) return 7;
  if (num === 11) return 6;
  if (num === 10) return 5;
  if (num === 7) return 4;
  if (num === 6) return 3;
  if (num === 5) return 2;
  if (num === 4) return 1;
  return 0;
}

io.on("connection", (socket) => {

  socket.on("create_room", () => {
    const roomId = Math.random().toString(36).substring(2, 7);
    rooms[roomId] = [socket.id];
    socket.join(roomId);
    socket.emit("room_created", roomId);
  });

  socket.on("join_room", (roomId) => {
    if (rooms[roomId] && rooms[roomId].length === 1) {
      rooms[roomId].push(socket.id);
      socket.join(roomId);

      const deck = createDeck();
      games[roomId] = {
        deck,
        hands: {
          [rooms[roomId][0]]: deck.splice(0,3),
          [rooms[roomId][1]]: deck.splice(0,3)
        },
        score: { p1:0, p2:0 }
      };

      rooms[roomId].forEach(player => {
        io.to(player).emit("start_game", {
          hand: games[roomId].hands[player]
        });
      });
    }
  });

  socket.on("play_card", ({ roomId, card }) => {
    io.to(roomId).emit("card_played", { player: socket.id, card });
  });

});

app.get("/", (req,res)=>{
  res.send(`
  <html>
  <head>
  <title>Truco Online</title>
  <style>
  body{background:#0b6623;color:white;text-align:center;font-family:Arial}
  button{padding:10px;margin:5px}
  .card{display:inline-block;padding:10px;margin:5px;border:1px solid white;cursor:pointer}
  </style>
  </head>
  <body>
  <h1>🧉 Truco Online</h1>
  <button onclick="createRoom()">Crear Sala</button>
  <input id="roomInput" placeholder="Código">
  <button onclick="joinRoom()">Unirse</button>
  <h3 id="roomCode"></h3>
  <div id="hand"></div>
  <div id="table"></div>
  <script src="/socket.io/socket.io.js"></script>
  <script>
  const socket = io();
  let roomId="";
  socket.on("room_created", id=>{
    roomId=id;
    document.getElementById("roomCode").innerText="Código: "+id;
  });
  socket.on("start_game", data=>{
    document.getElementById("hand").innerHTML="";
    data.hand.forEach(c=>{
      const div=document.createElement("div");
      div.className="card";
      div.innerText=c;
      div.onclick=()=>playCard(c);
      document.getElementById("hand").appendChild(div);
    });
  });
  socket.on("card_played", data=>{
    const div=document.createElement("div");
    div.innerText=data.card;
    document.getElementById("table").appendChild(div);
  });
  function createRoom(){ socket.emit("create_room"); }
  function joinRoom(){
    roomId=document.getElementById("roomInput").value;
    socket.emit("join_room", roomId);
  }
  function playCard(card){
    socket.emit("play_card",{roomId,card});
  }
  </script>
  </body>
  </html>
  `);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT);
