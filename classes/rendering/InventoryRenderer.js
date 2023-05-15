import App from "../app.js";
import vec from "../vec.js";
import RenderLayer from "./RenderLayer.js";

export default class InventoryRender extends RenderLayer {
    #app;
    #ctx;
    #positions=[];
    constructor(app, ctx) {
        super();
        if (app instanceof App) {
            this.#app = app;
        }
        if (ctx instanceof CanvasRenderingContext2D) {
            this.#ctx = ctx;
        }

        for (let i = 0; i < 6; i++) {
            let dir = new vec(Math.cos(i * 60 * (Math.PI / 180)), Math.sin(i * 60 * (Math.PI / 180)));
            this.#positions.push(dir);
        }
    }

    render() {
        const ctx = this.#ctx;
        if (ctx instanceof CanvasRenderingContext2D) {
            ctx.fillStyle = '#ffffff66';
            for (let i = 0; i < this.#positions.length; i++) {
                const element = this.#positions[i];
                ctx.fillRect(this.#app.renderer.width / 2 - 25 - element.x * 120, this.#app.renderer.height / 2 - 25 - element.y * 120, 50, 50);
                ctx.beginPath();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.moveTo(this.#app.renderer.width / 2, this.#app.renderer.height / 2);
                let pos = new vec(App.mousePosition.x * (this.#app.renderer.width / window.innerWidth), App.mousePosition.y * (this.#app.renderer.height / window.innerHeight));
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.closePath();
                ctx.fillText("Prototyping the setup for the future inventory format", pos.x, pos.y, 1000);
            }
        }
    }
}