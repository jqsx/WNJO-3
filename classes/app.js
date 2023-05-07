import ClientSocket from "./ClientSocket.js";
import LoginHandler from "./Handlers/LoginHandler.js";
import PingHandler from "./Handlers/PingHandler.js";
import PlayerHandler from "./Handlers/PlayerHandler.js";
import Player from "./Player.js";
import vec from "./vec.js";

const playerIMG = new Image();
playerIMG.src = "../client/src/player/playeridle.png";

export default class App {
    static instance;
    cameraPosition = new vec(0, 0);
    renderer = document.createElement("canvas");
    #ctx = this.renderer.getContext("2d");
    #clientSocket = ClientSocket;

    #keysDown = [];

    Players = new Map();
    #localPlayers = new Map();
    localPlayer;

    constructor() {
        App.instance = this;
        this.renderer.width = 1920;
        this.renderer.height = 1080;
        this.#ctx.imageSmoothingEnabled = false;
    }

    #time = Date.now();
    start() {
        this.#initializeSocket();
        this.#initializeUserInput();

        setInterval(() => {
            this.#time = Date.now();
            this.playerInput();
            this.frameRender();
        }, 1000 / 60);
    }

    #initializeSocket() {
        this.Players = new Map();
        this.#localPlayers = new Map();
        this.#clientSocket = new ClientSocket();
        this.#clientSocket.onerror = () => {
            this.#clientSocket.close();
        };
        this.#clientSocket.onclose = () => {
            console.log("Retrying connection in 500ms");
            setTimeout(() => {
                this.#initializeSocket();
            }, 500);
        };
        // handlers for each network event, if network event doesn't exist then event is ignored...
        this.#clientSocket.setHandler(PingHandler.getType(), new PingHandler());
        this.#clientSocket.setHandler(PlayerHandler.getType(), new PlayerHandler());
        this.#clientSocket.setHandler(LoginHandler.getType(), new LoginHandler());
    }

    #initializeUserInput() {
        window.addEventListener("keydown", (ev) => {
            if (!this.#keysDown.includes(ev.key)) 
                this.#keysDown.push(ev.key);
            


            console.log(ev.key);
            console.log(this.#keysDown);
        });
        window.addEventListener("keyup", (ev) => {
            for (let i = this.#keysDown.length - 1; i >= 0; i--) {
                const element = this.#keysDown[i];
                if (element === ev.key) {
                    this.#keysDown.splice(i, 1);
                }
            }
        });
    }

    isKeyDown(key) {
        return this.#keysDown.includes(key);
    }

    frameRender() {
        this.#ctx.clearRect(0, 0, this.renderer.width, this.renderer.height);
        this.Players.forEach((player) => {
            if (this.localPlayer !== undefined && this.localPlayer.id === player.id) 
                return;
            
            if (!this.#localPlayers.has(player.id)) {
                let lp = new Player(player);
                this.#localPlayers.set(player.id, lp);
                lp.position = new vec(player.position.x, player.position.y);
                console.log(player.position);
            }
            let lP = this.#localPlayers.get(player.id);
            lP.position.x = this.#lerp(lP.position.x, player.position.x, 0.1);
            lP.position.y = this.#lerp(lP.position.y, player.position.y, 0.1);
            this.#drawPlayer(lP);
        });

        if (this.localPlayer !== undefined) {
            this.#drawPlayer(this.localPlayer);
        }

        this.#ctx.font = "25px monospace";
        this.#ctx.fillText(Date.now() - this.#time + "ms", 0, 20, this.renderer.width);
        this.#ctx.fillText("Avaiable only 16ms for entire render, if we want to render at 60fps", 0, 40, this.renderer.width);
    }

    #drawPlayer(player) {
        const size = 15;
        const screenPosition = this.#worldToScreen(player.position);
        const scale = new vec(playerIMG.width / 2, playerIMG.height / 2);
        this.#ctx.drawImage(playerIMG, screenPosition.x -(scale.x / 2) * size, screenPosition.y -(scale.y / 2) * size, scale.x * size, scale.x * size);
    }

    playerInput() {
        if (this.isKeyDown("w")) {
            console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        }

        let x = this.#toInt(this.isKeyDown("d")) + this.#toInt(this.isKeyDown("a")) * -1;
        let y = this.#toInt(this.isKeyDown("w")) + this.#toInt(this.isKeyDown("s")) * -1;
        this.cameraPosition.x -= x;
        this.cameraPosition.y -= y;

        if (this.localPlayer !== undefined) {
            this.localPlayer.position.x = this.cameraPosition.x;
            this.localPlayer.position.y = this.cameraPosition.y;
        }

        this.#clientSocket.sendMessage("PUP", {position: this.cameraPosition});
    }

    #toInt(bool) {
        return bool ? 1 : 0;
    }

    #worldToScreen(position = vec) {
        return new vec(-(position.x - this.cameraPosition.x) * 10 + this.renderer.width / 2, (position.y - this.cameraPosition.y) * 10 + this.renderer.height / 2);
    }

    #lerp(a, b, t) {
        return a + (b - a) * this.#clamp(t, 0, 1);
    }

    #clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }
}
