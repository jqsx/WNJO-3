import { Handler } from "../ClientSocket.js";
import ClientSocket from "../ClientSocket.js";
import App from "../app.js";

export default class LoginHandler extends Handler {
    constructor() {
        super();
    }

    process(data, ws) {
        if (!(ws instanceof ClientSocket)) return false;
        const player = App.instance.Players.get(data.id);
        App.instance.localPlayer = player;
    }

    /*
    data
    player id
    
     */

    static getType() {
        return "LI";
    }
}