import { Handler } from "../ClientSocket.js";
import ClientSocket from "../ClientSocket.js";

export default class PingHandler extends Handler {
    constructor() {
        super();
    }

    process(data, ws) {
        if (!(ws instanceof ClientSocket)) return false;
        ws.sendMessage("ping", { msg: "Hello!" });
    }

    static getType() {
        return "ping";
    }
}