import vec from "../../vec.js";
import Particle from "../Particle.js";

export default class FireParticle extends Particle {

    spread = true;

    constructor(data) {
        super(data);

    }

    update(delta) {
        super.update(delta);
        if (Math.random() < 0.05) {
            new Particle({ position: this.position.clone().add(new vec((0.5 - Math.random()) * 32, Math.random() * 10)), texture: "smoke", velocity: new vec(0, -10), randomForces: new vec(10, -50)});
        }
        else if (Math.random() < 0.01) {
            let a = new FireParticle(this);
            a.position.x += (0.5 - Math.random()) * 32;
            a.position.y += (0.5 - Math.random()) * 32;
        }
    }
}