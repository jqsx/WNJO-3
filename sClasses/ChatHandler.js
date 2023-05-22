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
        let finMsg = {
            userData: [
                { color: "green", text: acc.name }
            ],
            message: [
                { text: message.msg }
            ]
        };

        this.#ServerSocket.clients.forEach(client => {
            this.#ServerSocket.sendMessage(client, [new DataMessage("CHAT", finMsg)]);
        })
    }
}