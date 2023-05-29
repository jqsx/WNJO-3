import vec from "../vec.js";

export default class Particle {

    position = new vec(0, 0);
    velocity = new vec(0, 0);
    hasGravity;
    texture;
    randomForces;

    lifetime = 1000;

    #start = performance.now();

    constructor(data) {
        if ("position" in data) this.position = data.position;
        if ("velocity" in data) this.velocity = data.velocity;
        if ("hasGravity" in data) this.hasGravity = data.hasGravity;
        if ("texture" in data) this.texture = data.texture;
        if ("randomForces" in data) this.randomForces = data.randomForces;
        if ("lifetime" in data) this.lifetime = data.lifetime;
    }

    update(delta) {
        this.velocity = this.velocity.add(new vec(Math.random() * delta * this.randomForces.x, Math.random() * delta * this.randomForces.y));
        this.position = this.position.add(this.velocity.multiply(delta));
        
        if (performance.now() > this.#start + this.lifetime) {
            return false;
        }
        return true;
    }
}