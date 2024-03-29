import { Handler } from "../ClientSocket.js";
import ClientSocket from "../ClientSocket.js";
import App from "../app.js";

export default class LoginHandler extends Handler {
    constructor() {
        super();
    }

    process(data, ws) {
        if (!(ws instanceof ClientSocket)) return false;
        this.#findAndAsignLocalPlayer(data);
        if ("ql" in data) {
            localStorage.setItem("ql", data.ql);
            console.log("ql");
        }
    }

    #findAndAsignLocalPlayer(data){
        const loop = setInterval(() => {
            const player = App.instance.Players.get(data.id);
            if (player !== undefined) {
                App.instance.localPlayer = player;
                App.instance.cameraPosition.x = player.position.x;
                App.instance.cameraPosition.y = player.position.y;
                console.log("Found and asigned local player.");
                document.getElementById('LIS').style.display = 'none';
                clearInterval(loop);
                App.instance.runGame();
            }
        }, 50);
    }

    /*
    data
    player id
    
     */

    static getType() {
        return "LI";
    }
}