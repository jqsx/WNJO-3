import Player from "../classes/Player.js";
import ServerSocket from "./Socket.js";
import WebSocket from "ws";

export default class PlayerHandler {
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
        let acc = this.#ServerSocket.Clients.get(ws);
        if (message === undefined) return;
        if (!(ws instanceof WebSocket)) return;

        else if (this.#ServerSocket.Players.has(acc.account)) {
            this.#updatePlayer(this.#ServerSocket.Players.get(acc.account), message);
        }
    }

    #updatePlayer(player, message) {
        if (!(player instanceof Player)) return;
        const position = message["position"];
        player.position.x = position.x;
        player.position.y = position.y;
    }
}