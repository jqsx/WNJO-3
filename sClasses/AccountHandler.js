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
    QuickLog = new Map();
    constructor(socket) {
        if (socket instanceof ServerSocket) {
            this.#ServerSocket = socket;
            fs.readFile(path.resolve('./AccountData/accounts.json'), (err, data) => {
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
        if (message === undefined) {
            this.#ServerSocket.sendErr(ws, "No Data");
            return;
        }
        
        if (!(ws instanceof WebSocket)) 
            return;
         else if (this.#ServerSocket.Clients.get(ws).account === null) {

            if (message.a === 'QL') {
                let acc = this.LoadedAccounts.get(this.QuickLog.get(message.ql).toLowerCase());
                if (acc !== undefined) {
                    let ql = crypto.randomUUID();
                    this.QuickLog.set(ql, acc.name);
                    this.#initializeNewPlayer(ws, acc, ql);
                    this.#ServerSocket.sendLog(ws, `Signed in with account ${acc.name}`);
                }
                else {
                    this.#ServerSocket.sendErr(ws, "Error signing in with quicklog.");
                }
                return;
            }

            if (!("n" in message && "p" in message)) {
                this.#ServerSocket.sendErr(ws, "Invalid parameters");
                return;
            } 
            else if ((message.n.length <= 3 || message.p.length <= 6 && message.n.length > 16 && message.p.length > 32)) {
                this.#ServerSocket.sendErr(ws, "Either the name, or the password exceeds the length bounds.\n\n The name can only be between 4 to 16 letters long and the password 7 to 32.");
                return;
            }

            const nameRegex = /[a-z0-9A-Z]/

            if (!nameRegex.test(message.n)) {
                this.#ServerSocket.sendErr(ws, "invalid characters");
                return;
            }
            // send error message
             // TODO: make a client side request error display
            if ("a" in message) {
                let acc = this.LoadedAccounts.get(message.n.toLowerCase());
                switch (message.a) {
                    case "CA":
                        // Create Account
                        if (acc === undefined) {
                            let nAcc = { // create new account and uuid
                                _ID: crypto.randomUUID(),
                                name: message.n,
                                pass: btoa(message.p),
                                rank: "player",
                                creationDate: Date.now(),
                                money: 0,
                                desc: ""
                            }
                            let ql = crypto.randomUUID();
                            this.QuickLog.set(ql, nAcc.name);
                            this.LoadedAccounts.set(message.n.toLowerCase(), nAcc);
                            this.#initializeNewPlayer(ws, nAcc, ql);
                        }
                        else {
                            this.#ServerSocket.sendErr(ws, "An account with this name already exists.");
                        }
                        break;
                    case "LI":
                        // Log In
                        if (acc === undefined) {
                            // no account found under name...
                            // send error message to client
                            this.#ServerSocket.sendErr(ws, "The account you're trying to log in with doesn't exist.");
                        }
                        else if (btoa(message.p) === acc.pass) {
                            let ql = crypto.randomUUID();
                            this.QuickLog.set(ql, acc.name);
                            this.#initializeNewPlayer(ws, acc, ql);
                            this.#ServerSocket.sendLog(ws, `Signed in with account ${acc.name}`);
                        }
                        else {
                            this.#ServerSocket.sendErr(ws, "The account you're trying to log in with doesn't exist.");
                        }
                        break;
                    default:
                        // Err
                        console.error("Unrecognized procedure");
                        this.#ServerSocket.sendErr(ws, "Unrecognized procedure");
                        
                        break;
                }
            }
        }
    }

    #initializeNewPlayer(ws, account, quicklog) {
        this.#ServerSocket.Clients.set(ws, {account: account._ID });
        var player = this.#ServerSocket.Players.get(account._ID);
        if (player === undefined) {
            player = new Player({name: account.name});
            this.#ServerSocket.Players.set(account._ID, player);
        }
        let playerUpdate = this.#ServerSocket.getPlayersUpdateDataMessage();
        let loginUpdate = new DataMessage("LI", {id: player.id, ql: quicklog});
        this.#ServerSocket.sendMessage(ws, [playerUpdate, loginUpdate]);
        console.log(player.id);
    }

    saveAccounts() {
        console.log("Saving");
        const jsondata = {};
        this.LoadedAccounts.forEach((value, key) => {
            jsondata[key] = value;
        });
        const data = JSON.stringify(jsondata);
        fs.writeFileSync('./AccountData/accounts.json', data);
        console.log("Saved");
    }
}
