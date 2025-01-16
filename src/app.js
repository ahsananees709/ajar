// import express from 'express';
// import cors from 'cors'
// import http from 'http'
// import 'dotenv/config'
// import { SERVER_PORT, SERVER_HOST } from './utils/constant.js';
// import routes from "./routes/index.js"
// import { deleteExpiredTokens } from '../db/triggers/trigger.js';
// // import { Server } from 'socket.io';

// const app = express()
// const server = http.createServer(app)
// // const io = new Server(server);

// app.use(cors())
// app.use(express.static("public"))
// app.use(express.json());
// app.use('/api',routes)


// server.listen(SERVER_PORT,SERVER_HOST,() =>
// { 
//     console.log(`Server is running on http://${SERVER_HOST}:${SERVER_PORT}`)
// })

import express from 'express';
import cors from 'cors';
import http from 'http';
import 'dotenv/config';
import { SERVER_PORT, SERVER_HOST } from './utils/constant.js';
import routes from "./routes/index.js";
import { deleteExpiredTokens } from '../db/triggers/trigger.js';
import { Server } from 'socket.io';
import { database } from '../db/db.js';
import { user } from '../db/schema/user.js';
import { eq } from 'drizzle-orm';


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",  
  }
});

app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use('/api', routes);

server.listen(SERVER_PORT, SERVER_HOST, () => { 
  console.log(`Server is running on http://${SERVER_HOST}:${SERVER_PORT}`);
});

let users = [];

const addUser = (userId, socketId) => {
  if (userId) {
    !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
  }
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};


// io.on("connection", (socket) => {
//   console.log("A user connected");


//   socket.on("addUser", async ({ userId, activeConversation }) => {
//     // console.log("ahsan",activeConversation)
//     addUser(userId, socket.id);
//     // await database.update(user).set({online: true, activeConversation: activeConversation}).where(eq(user.id, userId))
//     console.log("Connected users:", users);
//     io.emit("getUsers", users);
//   });

//   socket.on("sendMessage", ({ senderId, receiverId, text }) => {
//     const user = getUser(receiverId);
//     // console.log(text)
//     if (user) {
//       io.to(user.socketId).emit("getMessage", {
//         senderId,
//         text,
//       });
//     } else {
//       console.log("User not found or disconnected:", receiverId);
//     }
//   });

//   socket.on("offline", (userId) => {
//     // await database.update(user).set({online:false, activeConversation: null}).where(eq(user.id, userId))
//     console.log("A user disconnected");
//     removeUser(socket.id);
//     io.emit("getUsers", users); 
//   });
// });

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("addUser", async ({ userId, activeConversation }) => {
    addUser(userId, socket.id);

    try {
      // Await the database update to ensure state consistency
      await database
        .update(user)
        .set({ online: true, activeConversation: activeConversation })
        .where(eq(user.id, userId));
    } catch (err) {
      console.error("Error updating user online status:", err);
    }

    console.log("Connected users:", users);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);

    if (user) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
    } else {
      console.log("User not found or disconnected:", receiverId);
    }
  });

  socket.on("offline", async (userId) => {
    removeUser(socket.id);

    try {
      // Await the database update to ensure state consistency
      await database
        .update(user)
        .set({ online: false, activeConversation: null })
        .where(eq(user.id, userId));
    } catch (err) {
      console.error("Error updating user offline status:", err);
    }

    console.log("A user disconnected");
    io.emit("getUsers", users);
  });
});

