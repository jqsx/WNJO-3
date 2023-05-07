import Player from "../classes/Player.js";
import DataMessage from "./DataMessage.js";
import ServerSocket from "./Socket.js";
import WebSocket from "ws";
import fs from 'fs';
import path from "path";
import config from "../config.js";

export default class AccountHandler {
    #ServerSocket;
    LoadedAccounts = new Map();
    constructor(socket) {
        if (socket instanceof ServerSocket) {
            this.#ServerSocket = socket;
            fs.readFile(path.resolve('../AccountData/accounts.json'), (err, data) => {
                if (err) 
                    throw err;
                
                try {
                    const json = JSON.parse(data);
                    for (var x in json) {
                        this.LoadedAccounts.set(x, json[x]);
                    }
                } catch (err) {
                    console.error("Failed to parse account data!");
                }
            });
            console.log("Setup account handler");
        } else {
            throw new TypeError("wrong type");
        }
    }

    processRequest(message, ws) {
        if (message === undefined) 
            return;
        
        if (!(ws instanceof WebSocket)) 
            return;
         else if (this.#ServerSocket.Clients.get(ws).account === null) {
            if (!("n" in message && "p" in message)) 
                return; // send error message
             // TODO: make a client side request error display
            if ("a" in message) {
                let acc = this.LoadedAccounts.get(message.n);
                switch (message.a) {
                    case "CA":
                        // Create Account
                        if (acc === undefined) {
                            let nAcc = { // create new account and uuid
                                _ID: crypto.randomUUID(),
                                name: message.n,
                                pass: message.p
                            }
                            this.LoadedAccounts.set(message.n, nAcc);
                            this.#initializeNewPlayer(ws, nAcc);
                        }
                        break;
                    case "LI":
                        // Log In
                        if (acc === undefined) {
                            // no account found under name...
                            // send error message to client
                        }
                        else if (message.p === acc.pass) {
                            this.#initializeNewPlayer(ws, acc);
                        }
                        break;
                    case "QL":
                        // Quick Log
                        console.log("Quicklog");
                    default:
                        // Err
                        console.error("Unrecognized procedure");
                        break;
                }
            }
        }
    }

    #initializeNewPlayer(ws, account) {
        let player = new Player({name: account.name});
        this.Players.set(account._ID, player);
        let playerUpdate = this.#ServerSocket.getPlayersUpdateDataMessage();
        let loginUpdate = new DataMessage("LI", {id: player.id});
        this.#ServerSocket.sendMessage(ws, [playerUpdate, loginUpdate]);
    }

    saveAccounts() {
        const data = JSON.stringify(this.LoadedAccounts);
        fs.writeFile(path.resolve('../AccountData/accounts.json'), data);
    }
}
