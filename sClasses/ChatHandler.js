import DataMessage from "./DataMessage.js";
import ServerSocket from "./Socket.js";
import { WebSocket } from "ws";

export default class ChatHandler {
    #ServerSocket;
    constructor(socket) {
        if (socket instanceof ServerSocket) {
            this.#ServerSocket = socket;
            console.log("Setup player handler");
        }
        else {
            throw new TypeError("wrong type");
        }
    }

    processRequest(message, ws) {
        if (message === undefined) return;
        if (!(ws instanceof WebSocket)) return;
        let acc = this.#ServerSocket.Players.get(this.#ServerSocket.Clients.get(ws).account);
        let actualAcc = this.#ServerSocket.accountHandler.LoadedAccounts.get(acc.name);
        let userData = [];
        if (actualAcc.rank === 'admin') {
            userData.push({ color: "white", bold: true, background: "gold", text: "ADMIN"});
        }
        userData.push({ text: acc.name });
        

        let finMsg = {
            userData: userData,
            message: [
                { text: message.msg }
            ]
        };

        this.#ServerSocket.clients.forEach(client => {
            this.#ServerSocket.sendMessage(client, [new DataMessage("CHAT", finMsg)]);
        })
    }
}