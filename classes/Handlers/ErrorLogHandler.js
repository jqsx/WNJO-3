import { Handler } from "../ClientSocket.js";
import ClientSocket from "../ClientSocket.js";
import App from "../app.js";

export default class ErrorLogHandler extends Handler {
    #last = Date.now();
    constructor() {
        super();
    }
    
    process(data, ws) {
        if (!(ws instanceof ClientSocket)) return false;
        if (Date.now() - this.#last < 200) {
            setTimeout(() => {
                App.instance.log(data.message, data.code);
            }, Date.now() - this.#last);
        }
        else {
            App.instance.log(data.message, data.code);
        }
    }

    static getType() {
        return "ERR";
    }
}