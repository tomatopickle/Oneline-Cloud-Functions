// This server does all the heavy functions that require a lot of requests
const db = require("./fire.js");
const fetch = require("node-fetch");
const { ref, set, get, child, onValue, update, limitToLast, query, startAt, remove } = require("firebase/database");
var bodyParser = require('body-parser')
var cors = require('cors');
const express = require('express')
const app = express()
const port = 3000;
app.use(cors({
  origin: ["http://localhost:8080", "https://oneline.surge.sh"],
  optionsSuccessStatus: 200
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.get('/', (req, res) => {
  res.end(`Hey, don't come here, go here https://oneline.surge.sh`);
});
app.post('/group/update/avatar', (req, res) => {
  const chatId = req.body.id;
  get(child(ref(db), `chats/${chatId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val(), req.body);
      const group = snapshot.val();
      res.json(group);
      update(child(ref(db), `chats/${chatId}`), { avatar: req.body.avatar });
      console.log(group)
      group.members.forEach((user) => {
        console.log(user);
        update(child(ref(db), `users/${user}/chats/${chatId}`), { avatar: req.body.avatar });
      });
    } else {
      console.log("No data available");
      res.end("404");
    }
  }).catch((error) => {
    console.error(error);
  });
});
app.post('/group/update', (req, res) => {
  const chatId = req.body.id;
  get(child(ref(db), `chats/${chatId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val(), req.body);
      const group = snapshot.val();
      res.json(group);
      update(child(ref(db), `chats/${chatId}`), { name: req.body.name });
      update(child(ref(db), `chats/${chatId}`), { description: req.body.description });
      console.log(group)
      group.members.forEach((user) => {
        console.log(user);
        update(child(ref(db), `users/${user}/chats/${chatId}`), { description: req.body.description });
        update(child(ref(db), `users/${user}/chats/${chatId}`), { name: req.body.name });
      });
    } else {
      console.log("No data available");
      res.end("404");
    }
  }).catch((error) => {
    console.error(error);
  });
});
app.post('/group/leave', (req, res) => {
  const chatId = req.body.id;
  const userId = req.body.user;
  get(child(ref(db), `chats/${chatId}`)).then((snapshot) => {
    if (snapshot.exists()) {
      const group = snapshot.val();
      res.json(group);
      let members = group.members;
      console.log("changin data");
      members.splice(members.indexOf(userId), 1);
      remove(child(ref(db), `users/${userId}/chats/${chatId}`));
      update(child(ref(db), `chats/${chatId}`), { members: members });
      members.forEach((user) => {
        console.log(user);
        update(child(ref(db), `users/${user}/chats/${chatId}`), { members: members });
      });
    } else {
      console.log("No data available");
      res.end("404");
    }
  }).catch((error) => {
    console.error(error);
  });
});
app.post("/meetings/rooms", async (req, res) => {
  const exp = Math.round(Date.now() / 1000) + 60 * 30;
  const options = {
    properties: {
      exp,
      enable_chat: true,
      start_audio_off: true,
      start_video_off: true,
      enable_knocking: true
    },
  };
  // This endpoint is using the proxy as outlined in netlify.toml
  const response = await fetch(`https://api.daily.co/v1/rooms/`, {
    method: "POST",
    body: JSON.stringify(options),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.DAILY_API_KEY
    },
  });
  const room = await response.json();
  console.log(room);
  const tokenRes = await fetch(`https://api.daily.co/v1/meeting-tokens`, {
    method: "POST",
    body: JSON.stringify({ "properties": { "is_owner": true, "room_name": room.name } }),
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + process.env.DAILY_API_KEY
    },
  });
  const token = await tokenRes.json();
  console.log(token.token);
  res.json({ room, token: token.token });
});
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});