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

let gatheredCandidates = [];
let forwardCandidatesToUser;

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("userJoined", (user) => {
    addUser({
      socketId: socket.id,
      userId: user._id,
      name: user.name,
      email: user.email,
    });
    io.to(socket.id).emit("me", socket.id);
    console.log(users);
    io.emit("newUser", users);
  });

  socket.on("newIceCandidate", ({ candidate, to }) => {
    // setTimeout(() => {
    //   console.log("newIceCandidate", candidate);
    //   io.to(to).emit("newIceCandidate", { candidate });
    // }, 4000);
    gatheredCandidates.push(candidate);
    forwardCandidatesToUser = to;
  });

  socket.on("callUser", ({ offer, userToCall, callerId, name }) => {
    const from = { socketId: callerId, name };
    console.log("offer received: ", offer);
    io.to(userToCall).emit("callUser", { offer, from });
  });

  socket.on("answerCall", ({ answer, to }) => {
    console.log("answer received: ", answer);
    io.to(to).emit("callAccepted", { answer });

    gatheredCandidates.forEach((candidate) =>
      io.to(forwardCandidatesToUser).emit("newIceCandidate", { candidate })
    );
  });

  socket.on("hangup", () => {
    io.emit("hangup");
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
