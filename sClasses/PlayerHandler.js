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
        if (message === undefined) return;
        if (!(ws instanceof WebSocket)) return;

        else if (this.#ServerSocket.Players.has(ws)) {
            this.#updatePlayer(this.#ServerSocket.Players.get(ws), message);
        }
    }

    #updatePlayer(player, message) {
        if (!(player instanceof Player)) return;
        const position = message["position"];
        player.position.x = position.x;
        player.position.y = position.y;
    }
}