import App from "../app.js";
import vec from "../vec.js";

export default class RenderLayer {
    static Renderers = [];

    constructor() {
        RenderLayer.Renderers.push(this);
    }

    render(ctx) {

    }

    worldToScreen(position = vec) {
        let app = App.instance;
        return new vec(-(position.x - app.cameraPosition.x) * 10 + app.renderer.width / 2, (position.y - app.cameraPosition.y) * 10 + app.renderer.height / 2);
    }

    lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    }

    clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }
}