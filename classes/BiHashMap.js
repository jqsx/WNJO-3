export default class BiHashMap {
    #Values = new Map();

    constructor(data) {
        if (data !== undefined) {
            this.#Values = new Map(data);
        }
    }

    set(x, y, value) {
        if (!this.#Values.has(x)) {
            this.#Values.set(x, new Map());
        }
        this.#Values.get(x).set(y, value);
    }

    delete(x, y) {
        let z = this.get(x, y);
        this.#Values.get(x).delete(y);
        if (this.#Values.get(x).size === 0) {
            this.#Values.delete(x);
        }
        return z;
    }

    get(x, y) {
        return this.#Values.get(x).get(y);
    }

    getAllValues() {
        let arr = [];
        this.#Values.forEach((value) => {
            value.forEach(_value => {
                arr.push(_value);
            })
        })
        return arr;
    }

    toString() {
        var text = "";
        this.#Values.forEach((value, x) => {
            value.forEach((_value, y) => {
                text += `X: ${x} | Y: ${y} => ${_value}\n`;
            })
        })
        return text;
    }
}