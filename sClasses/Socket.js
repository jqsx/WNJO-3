import { WebSocketServer } from "ws";
import config from "../config.js";
import PlayerHandler from "./PlayerHandler.js";
import Player from "../classes/Player.js";
import os from 'os';
import DataMessage from "./DataMessage.js";
import AccountHandler from "./AccountHandler.js";
import BiHashMap from "../classes/BiHashMap.js";

export default class ServerSocket extends WebSocketServer {
    Clients = new Map(); // any type of connection 
    Players = new Map(); // when a client is associated with an account
    events = new Map();
    ChunkData = new BiHashMap();

    playerHandler;
    accountHandler;
    constructor() {
        super({ port: config.WSPORT });
        this.playerHandler = new PlayerHandler(this);
        this.accountHandler = new AccountHandler(this);
        this.registerExitProtocol();
        this.on('connection', (ws, req) => {
            console.log('new incoming connection...');
            this.Clients.set(ws, {account: null });
            ws.on('message', data => {
                try {
                    const json = JSON.parse(data);
                    if (json.TYPE === 'PUP') { // Player Update Procedure
                        this.playerHandler.processRequest(json.data, ws);
                    }
                    else if (json.TYPE === 'ARP') {
                        this.accountHandler.processRequest(json.data, ws);
                    }
                }
                catch (e) {
                    console.log("Something went wrong when processing request.")
                    console.log(e);
                }
            });
            ws.on('close', () => {
                console.log('Client disconnected...');
                this.Clients.delete(ws);
            });
        });

        setInterval(() => {
            this.pingAll();
        }, 3000);

        setInterval(() => {
            // update all player positions
            this.clients.forEach(client => {
                client.send(JSON.stringify([{ TYPE: "PUP", data: this.#getPlayers() }]))
            });
        }, 1000 / 10);

        
    }

    registerExitProtocol() {
        process.addListener('exit', () => {
            this.accountHandler.saveAccounts();
        });
        process.addListener('SIGINT', () => {
            process.exit();
        });
    }

    #getPlayers() {
        let arr = [];
        this.Players.forEach(value => {
            arr.push(value);
        })
        return arr;
    }
    
    getPlayersUpdateDataMessage() {
        return new DataMessage("PUP", this.#getPlayers);
    }

    sendMessage(ws, data) {
        ws.send(JSON.stringify(data));
    }

    pingAll() {
        this.clients.forEach(client => {
            client.send(JSON.stringify([{TYPE: "ping", data: "aaa"}]));
        });
        for (let i = 0; i < 10; i++) {
            console.log('\n');
        }
        console.log("Player count: " + this.Players.size);
        console.log("Client count: " + this.Clients.size);
        let index = 0;
        let outText = '';
        this.Players.forEach(value => {
            index++;
            if (index % 4 != 0) {
                outText += `PID:${value.name};POS:${value.position.toString()}   `
            }
            else {
                console.log(outText);
                outText = '';
            }
        });
        if (outText !== '') console.log(outText);
        const freeRAM = os.freemem();
        const totalRAM = os.totalmem();
        let total = totalRAM / (1024 * 1024);
        let used = freeRAM / (1024 * 1024);
        console.log("RAM USAGE: " + used + " / " + total + " MB");
    }

    sendErr(ws, message) {
        this.sendMessage(ws, [new DataMessage("ERR", { message: message, code: 400 })]);
    }

    sendLog(ws, message) {
        this.sendMessage(ws, [new DataMessage("ERR", { message: message, code: 200 })]);
    }

    sendWarn(ws, message) {
        this.sendMessage(ws, [new DataMessage("ERR", { message: message, code: 300 })]);
    }
}