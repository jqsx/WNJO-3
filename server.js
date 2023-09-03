import express from "express";
import config from "./config.js";
import path from 'path';
import ServerSocket from "./sClasses/Socket.js";

export default class Server {
  app = express();
  websocket = new ServerSocket();
  constructor() {
    this.app.use(express.json());
    this.app.use('/client', express.static('./client'));
    this.app.use('/classes', express.static('./classes'));

    this.app.listen(config.PORT, () => {
        console.log("listening on port " + config.PORT);
    });

    this.app.get('/', (req, res) => {
      res.sendFile(path.resolve('./index.html'));
    });

    this.app.get('/worlddata', (req, res) => {
      res.send(JSON.stringify(this.websocket.ChunkData.getAllValues()));
    });

    this.app.get('/font', (req, res) => {
      res.sendFile(path.resolve('./client/src/font/PressStart2P-Regular.ttf'));
    });
  }
};
