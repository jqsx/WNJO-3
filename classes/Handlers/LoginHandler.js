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
        }
    }

    #findAndAsignLocalPlayer(data){
        const loop = setInterval(() => {
            const player = App.instance.Players.get(data.id);
            if (player !== undefined) {
                App.instance.localPlayer = player;
                console.log("Found and asigned local player.");
                document.getElementById('LIS').style.display = 'none';
                clearInterval(loop);
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