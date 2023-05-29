import Textures from "../Textures.js";
import Particle from "../WorldDataClasses/Particle.js";
import RenderLayer from "./RenderLayer.js";
import App from "../app.js";
import { DEBUG } from "../DEBUG.js";

export default class ParticleRenderer extends RenderLayer {
    #app;
    #ctx;
    constructor(app, ctx) {
        super();
        if (app instanceof App) {
            this.#app = app;
        }
        if (ctx instanceof CanvasRenderingContext2D) {
            this.#ctx = ctx;
        }
    }

    render() {
        let data = Particle.Particles;
        DEBUG.log(`Particles: ${data.length}`);
        for (let i = data.length - 1; i >= 0; i--) {
            const particle = data[i];
            if (particle instanceof Particle) {
                if (particle.isDead()) {
                    Particle.Particles.splice(i, 1);
                    continue;
                }
                else {
                    particle.update(this.#app.deltaTime);
                }
                const tex = Textures.getTexture(particle.texture);
                const screenPosition = this.worldToScreen(particle.position);
                this.#ctx.translate(screenPosition.x, screenPosition.y);
                this.#ctx.rotate(particle.rotation);
                // this.#ctx.drawImage(tex, screenPosition.x - tex.width * 5, screenPosition.y - tex.height * 5, tex.width * 10, tex.height * 10);
                this.#ctx.drawImage(tex, -tex.width * 5, -tex.height * 5, tex.width * 10, tex.height * 10);
                this.#ctx.rotate(-particle.rotation);
                this.#ctx.translate(-screenPosition.x, -screenPosition.y);
            }
        }
    }
}