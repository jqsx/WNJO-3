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
            let dir = new vec(Math.cos(i * 60 * (Math.PI / 180) + Math.PI / 6), Math.sin(i * 60 * (Math.PI / 180)+ Math.PI / 6));
            this.#positions.push(dir);
        }
    }

    render() {
        const ctx = this.#ctx;
        const dist = (from, to) => {
            return Math.abs(to.x - from.x) + Math.abs(from.y - to.y);
        }
        if (ctx instanceof CanvasRenderingContext2D) {
            ctx.fillStyle = '#ffffff66';
            const pos = new vec(App.mousePosition.x * (this.#app.renderer.width / window.innerWidth), App.mousePosition.y * (this.#app.renderer.height / window.innerHeight));
            let distance = pos.distance(new vec(this.#app.renderer.width / 2, this.#app.renderer.height / 2));

            ctx.beginPath();
            ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();
            
            if (distance < 230) {

                for (let i = 0; i < this.#positions.length; i++) {
                    const element = this.#positions[i];
                    
                    const distance = dist(pos, element.multiply(-120).add(new vec(this.#app.renderer.width / 2, this.#app.renderer.height / 2)));
                    ctx.globalAlpha = 0.5 + (this.clamp(120 - distance, 0, 100)) / 100;
                    if (distance < 100) {
                        ctx.globalAlpha = 1;
                        ctx.fillRect(this.#app.renderer.width / 2 - 30 - element.x * 120, this.#app.renderer.height / 2 - 30 - element.y * 120, 60, 60);
                    }
                    else {
                        ctx.fillRect(this.#app.renderer.width / 2 - 25 - element.x * 120, this.#app.renderer.height / 2 - 25 - element.y * 120, 50, 50);
                    }
                }
                ctx.globalAlpha = 1;

                ctx.beginPath();
                ctx.strokeStyle = '#ffffffff';
                ctx.lineWidth = 1;
                ctx.moveTo(this.#app.renderer.width / 2, this.#app.renderer.height / 2);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                ctx.closePath();
            }
            // ctx.fillText("Debug " + pos.sub(new vec(this.#app.renderer.width / 2, this.#app.renderer.height / 2)).mag(), pos.x, pos.y, 1000);
        }
    }
}