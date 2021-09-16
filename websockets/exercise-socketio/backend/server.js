import http from "http";
import handler from "serve-handler";
import nanobuffer from "nanobuffer";
import { Server } from "socket.io";

const msg = new nanobuffer(50);
const getMsgs = () => Array.from(msg).reverse();

msg.push({
  user: "abhu-A_J",
  text: "This is the initial message",
  time: Date.now(),
});

// serve static assets
const server = http.createServer((request, response) => {
  return handler(request, response, {
    public: "./frontend",
  });
});

// create a new io server
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Connected" + socket.id);

  // writing off an event (there can be many events)
  socket.emit("msg:get", { msg: getMsgs() });

  // beneath socket.emit("msg:get")
  socket.on("msg:post", (data) => {
    msg.push({
      user: data.user,
      text: data.text,
      time: Date.now(),
    });

    // io means the whole server
    io.emit("msg:get", { msg: getMsgs() });
  });

  socket.on("disconnect", () => {
    console.log("Disconnected" + socket.id);
  });
});

const port = process.env.PORT || 8080;
server.listen(port, () =>
  console.log(`Server running at http://localhost:${port}`)
);
