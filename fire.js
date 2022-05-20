/* eslint-disable */
const { initializeApp } = require('firebase/app');

const { getDatabase, ref, child, get } = require("firebase/database");
const config = {
  apiKey: process.env.apiKey,
  authDomain: "oneline-9a9e1.firebaseapp.com",
  databaseURL: "https://oneline-9a9e1-default-rtdb.firebaseio.com/",
  projectId: "oneline-9a9e1",
  storageBucket: "oneline-9a9e1.appspot.com",
  messagingSenderId: "1024167995665",
  appId: process.env.appId
};

var fire = initializeApp(config);
const db = getDatabase(fire);
module.exports = db
