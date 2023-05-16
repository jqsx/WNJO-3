import App from "../app.js";
import RenderLayer from "./RenderLayer.js";
import Textures from "../Textures.js";
import vec from "../vec.js";
import Player from "../Player.js";

export default class PlayerRenderer extends RenderLayer {
    #app;
    #ctx;
    #localPlayers = new Map();
    constructor(app, ctx) {
        super();
        if (app instanceof App) {
            this.#app = app;
        }
        if (ctx instanceof CanvasRenderingContext2D) {
            this.#ctx = ctx;
        }
    }

    render() {
        let localPlayer = this.#app.localPlayer;
        this.#app.Players.forEach((player) => {
            if (localPlayer !== undefined && localPlayer.id === player.id) 
                return;
            
            if (!this.#localPlayers.has(player.id)) {
                let lp = new Player(player);
                this.#localPlayers.set(player.id, lp);
                lp.position = new vec(player.position.x, player.position.y);
                console.log(player.position);
            }
            let lP = this.#localPlayers.get(player.id);
            lP.position.x = this.lerp(lP.position.x, player.position.x, 0.3);
            lP.position.y = this.lerp(lP.position.y, player.position.y, 0.3);
            this.#drawPlayer(lP);
        });

        if (localPlayer !== undefined) {
            this.#drawPlayer(localPlayer);
        }
    }

    #drawPlayer(player) {
        let playerIMG = Textures.getTexture("player-idle");
        const size = 15;
        const screenPosition = this.worldToScreen(player.position);
        const scale = new vec(playerIMG.width / 2, playerIMG.height / 2);
        this.#ctx.drawImage(playerIMG, screenPosition.x - (scale.x * size / 4), screenPosition.y - (scale.y * size / 2), scale.x * size, scale.x * size);
        this.#ctx.fillText(player.name, screenPosition.x - (scale.x * size / 4), screenPosition.y - (scale.y * size / 2), 300);
    }
}