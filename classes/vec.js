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

    multiply(value) {
        return new vec(this.x * value, this.y * value);
    }

    add(other) {
        return new vec(this.x + other.x, this.y + other.y);
    }
    
    sub(other) {
        return new vec(this.x - other.x, this.y - other.y);
    }

    mag() {
        let dx = Math.abs(this.x);
        let dy = Math.abs(this.y);
        return 0.5 * (dx + dy + Math.max(dx, dy));
    }

    normalized() {
        let m = this.mag();
        return new vec(this.x / m, this.y / m);
    }

    distance(other) {
        let diff = this.sub(other);
        return diff.mag();
    }

    lerp(other, t) {
        const lerp = (a,b,t) => { return a + (b - a) * Math.max(Math.min(t, 1), 0); };
        this.x = lerp(this.x, other.x, t);
        this.y = lerp(this.y, other.y, t);
    }

    clone() {
        return new vec(this.x, this.y);
    }
}