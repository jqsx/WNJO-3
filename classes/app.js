import ClientSocket from "./ClientSocket.js";
import ErrorLogHandler from "./Handlers/ErrorLogHandler.js";
import LoginHandler from "./Handlers/LoginHandler.js";
import PingHandler from "./Handlers/PingHandler.js";
import PlayerHandler from "./Handlers/PlayerHandler.js";
import Player from "./Player.js";
import Textures from "./Textures.js";
import vec from "./vec.js";
import BiHashMap from './BiHashMap.js';

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
    ChunkData = new BiHashMap();

    constructor() {
        App.instance = this;
        this.renderer.width = 1920;
        this.renderer.height = 1080;
        this.#ctx.imageSmoothingEnabled = false;
        Textures.initializeImages();
    }

    #time = Date.now();
    start() {
        this.#initializeSocket();
        this.#initializeUserInput();
    }

    runGame() {
        setInterval(() => {
            document.getElementById('debug').innerText = "";
            this.#time = Date.now();
            this.playerInput();
            this.frameRender();
        }, 1000 / 60);
    }

    #initializeSocket() {
        this.Players = new Map();
        this.#localPlayers = new Map();
        this.localPlayer = undefined;
        this.#clientSocket = new ClientSocket();
        this.#clientSocket.onopen = () => {
            let ql = localStorage.getItem('ql');
            if (ql !== null) {
                this.#clientSocket.sendMessage("ARP", { a: "QL", ql: ql });
            }
        };
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
        this.#clientSocket.setHandler(ErrorLogHandler.getType(), new ErrorLogHandler());

        console.log("Bing bong")
    }

    #initializeUserInput() {
        window.addEventListener("keydown", (ev) => {
            if (!this.#keysDown.includes(ev.key)) 
                this.#keysDown.push(ev.key);
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
        this.#ctx.fillStyle = 'white';

        this.#drawChunks();

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
            lP.position.x = this.#lerp(lP.position.x, player.position.x, 0.3);
            lP.position.y = this.#lerp(lP.position.y, player.position.y, 0.3);
            this.#drawPlayer(lP);
        });

        if (this.localPlayer !== undefined) {
            this.#drawPlayer(this.localPlayer);
        }

        this.#ctx.font = "25px monospace";
        this.#ctx.fillText(Date.now() - this.#time + "ms", 0, 20, this.renderer.width);
    }

    log(message, code) {
        const log = document.getElementById('log');
        let sysmsg = document.createElement('sysmsg');
        sysmsg.innerText = `[${code}]\n${message}`;
        switch (code) {
            case 200:
                sysmsg.style.backgroundColor = '#57bb78';
                break;
            case 400:
                sysmsg.style.backgroundColor = '#ff0000';
                break;
            case 300:
                break;
            default:
                sysmsg.innerText += " (UNKNOWN CODE)";
                break;
        }
        log.appendChild(sysmsg);
        setTimeout(() => {
            sysmsg.remove();
        }, 5000);
    }

    #drawPlayer(player) {
        let playerIMG = Textures.getTexture("player-idle");
        const size = 15;
        const screenPosition = this.#worldToScreen(player.position);
        const scale = new vec(playerIMG.width / 2, playerIMG.height / 2);
        this.#ctx.drawImage(playerIMG, screenPosition.x -(scale.x / 2) * size, screenPosition.y -(scale.y / 2) * size, scale.x * size, scale.x * size);
        this.#ctx.fillText(player.name, screenPosition.x -(scale.x / 2) * size, screenPosition.y -(scale.y / 2) * size, 300);
    }

    #drawChunks() {
        let block = Textures.getTexture("block");
        const size = 15;
        let chunkPos = new vec(Math.round(this.localPlayer.position.x / (256)), Math.round(this.localPlayer.position.y / (256)));
        let chunk = this.ChunkData.get(chunkPos.x, chunkPos.y);
        
        let screenPosition = this.#worldToScreen(chunkPos.multiply(256));

        this.#ctx.drawImage(block, screenPosition.x, screenPosition.y, 16 * size, 16 * size);

        document.getElementById('debug').innerText += `\nChunk ${chunkPos}`;
        document.getElementById('debug').innerText += `\nChunk ${JSON.stringify(chunk)}`;
    }

    playerInput() {
        let x = this.#toInt(this.isKeyDown("d")) + this.#toInt(this.isKeyDown("a")) * -1;
        let y = this.#toInt(this.isKeyDown("w")) + this.#toInt(this.isKeyDown("s")) * -1;
        this.cameraPosition.x -= x;
        this.cameraPosition.y -= y;

        if (this.localPlayer !== undefined) {
            this.localPlayer.position.x = this.cameraPosition.x;
            this.localPlayer.position.y = this.cameraPosition.y;
            document.getElementById('debug').innerText += "\nLocal Player Position: " + this.localPlayer.position;
        }
        document.getElementById('debug').innerText += "\nCamera Position: " + this.cameraPosition.toString();

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

    AccountRetrieval(type) {
        let name = document.getElementById("NI").value;
        let pass = document.getElementById("PI").value;
        switch (type) {
            case "create":
                this.#clientSocket.sendMessage("ARP", { a: "CA", n: name, p: pass });
                break;
            case "login":
                this.#clientSocket.sendMessage("ARP", { a: "LI", n: name, p: pass });
                break;
            default:
                this.log("Something went wrong when logging in...", 400);
                break;
        }
    }
}
