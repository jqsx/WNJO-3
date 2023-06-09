import ClientSocket from "./ClientSocket.js";
import ErrorLogHandler from "./Handlers/ErrorLogHandler.js";
import LoginHandler from "./Handlers/LoginHandler.js";
import PingHandler from "./Handlers/PingHandler.js";
import PlayerHandler from "./Handlers/PlayerHandler.js";
import Textures from "./Textures.js";
import vec from "./vec.js";
import BiHashMap from './BiHashMap.js';
import InventoryRender from "./rendering/InventoryRenderer.js";
import PlayerRenderer from "./rendering/PlayerRenderer.js";
import ChunkRenderer from "./rendering/ChunkRenderer.js";
import { PlayerCollision } from "./PlayerCollision.js";
import { DEBUG } from "./DEBUG.js";
import ChatHandler from "./Handlers/ChatHandler.js";
import ParticleRenderer from "./rendering/ParticleRenderer.js";
import Particle from "./WorldDataClasses/Particle.js";
import FireParticle from "./WorldDataClasses/Particles/FireParticle.js";

export default class App {
    static instance;
    static mousePosition = new vec(0, 0);
    cameraPosition = new vec(0, 0);
    PlayerInputDirection = new vec(0, 0);
    renderer = document.createElement("canvas");
    #ctx = this.renderer.getContext("2d");
    #clientSocket = ClientSocket;
    deltaTime = 0;

    #keysDown = [];

    Players = new Map();
    localPlayer;
    ChunkData = new BiHashMap();

    renderingStack = {
        InventoryRender: new InventoryRender(this, this.#ctx),
        PlayerRenderer: new PlayerRenderer(this, this.#ctx),
        ChunkRenderer: new ChunkRenderer(this, this.#ctx),
        ParticleRenderer: new ParticleRenderer(this, this.#ctx)
    };

    playerCollider = new PlayerCollision(this);

    constructor() {
        App.instance = this;
        this.renderer.width = 1920;
        this.renderer.height = 1080;
        this.#ctx.imageSmoothingEnabled = false;
        Textures.initializeImages();

        let ui = document.getElementById('ui');
        for (let i = 0; i < 5; i++) {
            if (i < 2) {
                ui.appendChild(Textures.getTexture('ui-fullHeart').cloneNode());
            } else if (i == 2) {
                ui.appendChild(Textures.getTexture('ui-halfHeart').cloneNode());
            }
            else {
                ui.appendChild(Textures.getTexture('ui-noHeart').cloneNode());
            }
        }
        let uiamr = document.getElementById('ui-armr');
        for (let i = 0; i < 5; i++) {
            if (i < 2) {
                uiamr.appendChild(Textures.getTexture('ui-fullArmor').cloneNode());
            } else if (i == 2) {
                uiamr.appendChild(Textures.getTexture('ui-halfArmor').cloneNode());
            }
        }
        // temporary ui generation 
    }

    #time = performance.now();
    start() {
        this.#initializeSocket();
        this.#initializeUserInput();
    }

    runGame() {
        if (this.#clientSocket.readyState !== this.#clientSocket.OPEN) {
            this.log("Game has started but client socket is not ready...", 300);
            setTimeout(() => {
                this.runGame();
            }, 500);
        }
        else {
            this.#beginUpdateLoop();
        }
    }

    #beginUpdateLoop() {
        const loop = () => {
            document.getElementById('debug').innerText = "";
            this.playerInput();
            this.frameRender();
            if (this.#clientSocket.readyState !== this.#clientSocket.OPEN) {
                clearInterval(loop);
                this.log("Socket conn err", 400);
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
            this.deltaTime = (performance.now() - this.#time) / 1000.0;
            this.deltaTime = Math.max(Math.min(this.deltaTime, 1), 0);
            this.#time = performance.now();
            window.requestAnimationFrame(() => {
                loop();
            });
        };
        window.requestAnimationFrame(() => {
            loop();
        });
    }

    #initializeSocket() {
        this.Players = new Map();
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
        this.#clientSocket.setHandler(ChatHandler.getType(), new ChatHandler(this.#clientSocket));

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
        window.addEventListener('mousemove', (ev) => {
            App.mousePosition.x = ev.pageX;
            App.mousePosition.y = ev.pageY;
        })
    }

    isKeyDown(key) {
        return this.#keysDown.includes(key);
    }

    frameRender() {
        this.#ctx.clearRect(0, 0, this.renderer.width, this.renderer.height);
        this.#ctx.fillStyle = 'white';

        // render stack

        this.renderingStack.ChunkRenderer.render();
        this.renderingStack.PlayerRenderer.render();
        this.renderingStack.ChunkRenderer.nonSolidPlayerPass();
        this.renderingStack.ParticleRenderer.render();
        this.renderingStack.InventoryRender.render();
        DEBUG.draw(this.#ctx);

        // end of render stack

        this.#ctx.font = "25px monospace";
        this.#ctx.fillText(Math.floor(1 / this.deltaTime)+ "FPS", 0, 20, this.renderer.width);
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

    playerInput() {

        if (this.isKeyDown(" ")) {
            // new Particle({ position: this.localPlayer.position.clone(), texture: "fire", velocity: new vec((0.5 - Math.random()) * 100, (0.5 - Math.random()) * 100)})
            // const pos = new vec(App.mousePosition.x * (this.renderer.width / window.innerWidth), App.mousePosition.y * (this.renderer.height / window.innerHeight));
            let dir = this.screenToWorld(App.mousePosition).sub(this.localPlayer.position).normalized().multiply(300);
            new Particle({ position: this.localPlayer.position.clone(), texture: "leaf", velocity: dir});
            // new FireParticle({ position: this.localPlayer.position.clone(), texture: "fire" });
        }


        let x = this.#toInt(this.isKeyDown("d")) + this.#toInt(this.isKeyDown("a")) * -1;
        let y = this.#toInt(this.isKeyDown("w")) + this.#toInt(this.isKeyDown("s")) * -1;

        DEBUG.debugLine(this.localPlayer.position, this.screenToWorld(App.mousePosition));

        if (this.localPlayer !== undefined) {
            let move = new vec(x, y).multiply(45 * this.deltaTime);
            this.localPlayer.position.x -= move.x;
            this.localPlayer.position.y -= move.y;
            this.playerCollider.updateCollisions(move);
            this.cameraPosition.lerp(this.localPlayer.position, this.deltaTime * 10);
            document.getElementById('debug').innerText += "\nLocal Player Position: " + this.localPlayer.position;
        }
        document.getElementById('debug').innerText += "\nCamera Position: " + this.cameraPosition.toString();

        if (x !== 0 || y !== 0) this.#clientSocket.sendMessage("PUP", {position: this.localPlayer.position});
    }

    #toInt(bool) {
        return bool ? 1 : 0;
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

    screenToWorld(position = vec) {
        const pos = new vec(position.x * (this.renderer.width / window.innerWidth), position.y * (this.renderer.height / window.innerHeight));
        return new vec((pos.x - this.renderer.width / 2) / -10 + this.cameraPosition.x, (pos.y - this.renderer.height / 2) / 10 + this.cameraPosition.y);
    }
}
