import { Handler } from "../ClientSocket.js";
import ClientSocket from "../ClientSocket.js";

export default class ChatHandler extends Handler {
    #ChatMsgElementTracker = [];
    #MainParent = document.querySelector('chat-box');
    #InputArea;
    #ws;

    constructor(ws) {
        super();
        if (ws instanceof ClientSocket) {
            this.#ws = ws;
        }
        else {
            throw new Error("gib socket");
        }
        const setupinputarea = () => {
            this.#InputArea = document.getElementById('chat-input');
            if (this.#InputArea === null) {
                return;
            }
            else {
                window.addEventListener('keydown', ev => {
                    if (ev.key === 'Enter' && document.activeElement === this.#InputArea) {
                        this.#ws.sendMessage("CHAT", { msg: this.#InputArea.value });
                        this.#InputArea.value = '';
                    }
                });
                clearInterval(loop);
            }
        }
        const loop = setInterval(() => {
            setupinputarea();
        }, 50);
    }

    process(data, ws) {
        if (!(ws instanceof ClientSocket)) return false;
        this.createChatMsgElement(data.userData, data.message);
        console.log(JSON.stringify(data));
    }

    createChatMsgElement(userData, message) {
        const parent = document.createElement('chat-message');
        userData.forEach(element => {
            const c = document.createElement('span');
            if ("color" in element) {
                c.style.color = element.color;
            }
            c.innerText = element.text;
            parent.appendChild(c);
        });
        let idksomebullshithere = document.createElement('span');
        idksomebullshithere.innerText = ': ';
        parent.appendChild(idksomebullshithere);

        message.forEach(element => {
            const c = document.createElement('span');
            if ("color" in element) {
                c.style.color = element.color;
            }
            c.innerText = element.text;
            parent.appendChild(c);
        });
        this.#MainParent.append(parent);
        this.#ChatMsgElementTracker.push(parent);
        if (this.#ChatMsgElementTracker.length > 200) {
            this.#ChatMsgElementTracker[0].remove();
            this.#ChatMsgElementTracker.splice(0, 1);
        }

        parent.scrollIntoView();
    }

    static getType() {
        return "CHAT";
    }
}