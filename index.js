const http = require("http");
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const { users, addUser, removeUser } = require("./users");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: "GET,POST",
  },
});

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  socket.on("userJoined", (user) => {
    addUser({
      socketId: socket.id,
      userId: user._id,
      name: user.name,
      email: user.email,
    });
    io.to(socket.id).emit("me", socket.id);
    io.emit("newUser", users);
  });

  socket.on("newIceCandidate", ({ candidate, to }) => {
    io.to(to).emit("newIceCandidate", { candidate });
  });

  socket.on("callUser", ({ offer, userToCall, callerId, name }) => {
    const from = { socketId: callerId, name };
    io.to(userToCall).emit("callUser", { offer, from });
  });

  socket.on("answerCall", ({ answer, to }) => {
    io.to(to).emit("callAccepted", { answer });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));