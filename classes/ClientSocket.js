const url = `ws://${window.location.hostname}:7777/ws`;
export default class ClientSocket extends WebSocket {
    #handlers = new Map();
    constructor() {
        super(url);
        this.addEventListener('message', data => {
            try {
                const json = JSON.parse(data.data);
                json.forEach(msg => {
                    this.messageHandler(msg);
                })
            } catch (e) {
                console.log("Something went wrong while parsing message");
                console.error(e);
            }
        })
        console.log("Registered client socket");
    }

    messageHandler(message) {
        if ("TYPE" in message) {
            if (this.#handlers.has(message.TYPE)) {
                const handler = this.#handlers.get(message.TYPE);
                if (handler instanceof Handler) {
                    handler.process(message.data, this);
                }
                else {
                    throw new TypeError('(How did this even happen???) Handlers must be of class Handler!!!');
                }
            }
            else {
                console.error(`Type ${message.TYPE} isn't supported locally.`);
                console.error(`MSG: ${JSON.stringify(message)}`);
            }
        }
        else {
            console.error(`TYPE is undefined ${JSON.stringify(message)}`);
        }
    }

    setHandler(type, handler) {
        if (handler instanceof Handler) {
            this.#handlers.set(type, handler);
        }
        else {
            throw new TypeError("Parameter 'handler' must be a Handler");
        }
    }

    sendMessage(type, data) {
        if (this.readyState != this.OPEN) return;
        this.send(JSON.stringify({ TYPE: type, data: data }));
    }
}

export class Handler {

    constructor() {}

    process(data, ws) {

    }

    static getType() {
        return null;
    }
}