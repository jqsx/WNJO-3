import vec from "./vec.js";
import App from "./app.js";

export class DEBUG {
    static Rays = [];
    static Lines = [];
    static Points = [];

    static log(msg) {
        document.getElementById('debug').innerText += `\n${msg}`;
    }

    static clear() {
        this.Rays = [];
        this.Points = [];
        this.Lines = [];
    }

    static debugRay(pos, dir) {
        if (pos instanceof vec && dir instanceof vec) {
            this.Rays.push({ pos: pos, dir: dir });
        }
    }

    static debugLine(from, to) {
        if (from instanceof vec && to instanceof vec) {
            this.Lines.push({ from: from, to: to });
        }
    }

    static debugPoint(pos) {
        if (pos instanceof vec) {
            this.Points.push(pos);
        }
    }

    static draw(ctx) {
        if (ctx instanceof CanvasRenderingContext2D) {
            ctx.strokeStyle = '#ff0000';
            this.Rays.forEach(ray => {
                let from = this.worldToScreen(ray.pos);
                let to = this.worldToScreen(ray.pos.add(ray.dir));
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
                ctx.closePath();
            });
            this.Lines.forEach(line => {
                ctx.font = '10px';
                let from = this.worldToScreen(line.from);
                let to = this.worldToScreen(line.to);
                ctx.beginPath();
                ctx.moveTo(from.x, from.y);
                ctx.lineTo(to.x, to.y);
                ctx.stroke();
                ctx.closePath();
                let textpos = this.worldToScreen(line.from.add(line.to).multiply(0.5));
                ctx.fillText(`D: ${Math.round(line.from.distance(line.to) * 10) / 10}`, textpos.x, textpos.y);
                ctx.fillText(`F: ${line.from}`, textpos.x, textpos.y + 11);
                ctx.fillText(`T: ${line.to}`, textpos.x, textpos.y + 22);
            });
            this.Points.forEach(point => {
                let at = this.worldToScreen(point);
                ctx.beginPath();
                ctx.arc(at.x, at.y, 20, 0, Math.PI * 2);
                ctx.stroke();
                ctx.closePath();
            });
            this.clear();
        }
    }

    static worldToScreen(position = vec) {
        let app = App.instance;
        return new vec(-(position.x - app.cameraPosition.x) * 10 + app.renderer.width / 2, (position.y - app.cameraPosition.y) * 10 + app.renderer.height / 2);
    }

    static lerp(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    }

    static clamp(n, min, max) {
        return Math.min(Math.max(n, min), max);
    }
}