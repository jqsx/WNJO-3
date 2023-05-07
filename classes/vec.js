export default class vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    compare(other=vec) {
        return other.x == this.x && other.y == this.y;
    }

    toString() {
        return `X:${this.x}Y:${this.y}`;
    }
}