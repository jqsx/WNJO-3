import { Handler } from "../ClientSocket.js";
import ClientSocket from "../ClientSocket.js";
import Player from "../Player.js";
import App from "../app.js";

export default class PlayerHandler extends Handler {

    constructor() {
        super();
    }

    process(data, ws) {
        if (!(ws instanceof ClientSocket)) return false;
        if (data === undefined) return;
        data.forEach(element => {
            if (App.instance.Players.has(element.id)) {
                let player = App.instance.Players.get(element.id);
                player.position.x = element.position.x;
                player.position.y = element.position.y;
                if (player === App.instance.localPlayer) {
                    if (Math.abs(player.position.x - App.instance.cameraPosition.x) > 5) App.instance.cameraPosition.x = player.position.x;
                    if (Math.abs(player.position.y - App.instance.cameraPosition.y) > 5) App.instance.cameraPosition.y = player.position.y;
                }
            }
            else {
                App.instance.Players.set(element.id, new Player(element));
            }
        });
    }

    static getType() {
        return "PUP";
    }
}