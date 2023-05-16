import { WebSocketServer } from "ws";
import config from "../config.js";
import PlayerHandler from "./PlayerHandler.js";
import Player from "../classes/Player.js";
import os from 'os';
import DataMessage from "./DataMessage.js";
import AccountHandler from "./AccountHandler.js";
import BiHashMap from "../classes/BiHashMap.js";
import Chunk from "../classes/WorldDataClasses/Chunk.js";
import vec from "../classes/vec.js";

// import SimplexNoise from 'simplex-noise';
import WorldBlock from "../classes/WorldDataClasses/WorldBlock.js";
import { createNoise2D } from "simplex-noise";
const bingnoise = createNoise2D(() => {
    return 12345;
});

const noise = (x, y) => {
    let z = bingnoise(x, y);
    return (z + 1) / 2.0;
}

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
        this.generateSomeChunksIg();
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

    generateSomeChunksIg() {
        for (let x = -16; x <= 16; x++) {
            for (let y = -16; y <= 16; y++) {

                let arr = [];
                for (let _x = 0; _x < 16; _x++) {
                    for (let _y = 0; _y < 16; _y++) {
                        let tP = new vec((x * 256 + _x * 16) / 256, (y * 256 + _y * 16) / 256);
                        if (noise(tP.x, tP.y) < 0.3 && noise(tP.x, tP.y) < 0.6) {
                            arr.push(new WorldBlock({position: new vec(_x * 16, _y * 16), texture: "stone"}));
                        }
                        else if (noise(tP.x, tP.y) > 0.4 && noise(tP.x * 8, tP.y * 8) > 0.4 && (x + y) % 2 == 0) {
                            arr.push(new WorldBlock({position: new vec(_x * 16, _y * 16), texture: Math.random() < 0.5 ? "tree" : "smalltree"}));
                        }
                    }
                }

                this.ChunkData.set(x, y, new Chunk(new vec(x, y), arr));
            }
        }
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
        console.log(`Chunks: ${this.ChunkData.Values.size}`);
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