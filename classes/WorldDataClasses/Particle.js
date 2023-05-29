import vec from "../vec.js";

export default class Particle {
    static Particles = [];
    static MAXPARTICLES = 2000;
    position = new vec(0, 0);
    velocity = new vec(0, 0);
    hasGravity = false;
    texture = "none";
    randomForces = new vec(0, 0);
    dampen=0;
    rotation = 0;

    lifetime = 1000;

    #start = Date.now();

    constructor(data) {
        if (Particle.Particles.length > Particle.MAXPARTICLES) return;
        if ("position" in data) this.position = data.position;
        if ("velocity" in data) this.velocity = data.velocity;
        if ("hasGravity" in data) this.hasGravity = data.hasGravity;
        if ("texture" in data) this.texture = data.texture;
        if ("randomForces" in data) this.randomForces = data.randomForces;
        if ("lifetime" in data) this.lifetime = data.lifetime;
        if ("dampen" in data) this.dampen = data.dampen;
        if ("rotation" in data) this.rotation = data.rotation;
        Particle.Particles.push(this);
    }

    update(delta) {
        let change = this.velocity.multiply((1 - this.dampen * delta)).add(new vec(Math.random() * delta * this.randomForces.x, Math.random() * delta * this.randomForces.y));
        this.velocity.x = change.x;
        this.velocity.y = change.y;
        let updated = this.velocity.multiply(delta);
        this.position.x += updated.x;
        this.position.y += updated.y;
    }

    isDead() {
        return Date.now() > this.#start + this.lifetime;
    }
}