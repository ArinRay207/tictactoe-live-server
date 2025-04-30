import express from 'express';
import { Manager } from "./models/Manager.js";
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

const app = express();

app.get("/", (req, res) => res.send("Welcome!"));

const manager = new Manager();

let socketCount = 0;

wss.on('connection', (ws) => {
    ws.id = socketCount++;
    manager.addListeners(ws);
});
