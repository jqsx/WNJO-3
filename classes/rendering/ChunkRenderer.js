import App from "../app.js";
import RenderLayer from "./RenderLayer.js";
import Textures from "../Textures.js";
import vec from "../vec.js";
import Chunk from "../WorldDataClasses/Chunk.js";

export default class ChunkRenderer extends RenderLayer {
    #app;
    #ctx;
    #currentRenderNonSolids = [];
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
        const localPlayer = this.#app.localPlayer;
        let localPosition = new vec(Number(localPlayer.position.x), Number(localPlayer.position.y));
        // let block = Textures.getTexture("block");
        let texture_chunk = Textures.getTexture("chunk");
        const size = 15;
        let chunkPos = new vec(Math.floor(localPlayer.position.x / (256)), Math.floor(localPlayer.position.y / (256))); 
        let chunk = this.#app.ChunkData.get(chunkPos.x, chunkPos.y);

        var dir = new vec(chunk.chunkPosition.x * 256 + 128, chunk.chunkPosition.y * 256 + 128);

        // this.#ctx.fillStyle = '#0000ff55';
        // let cSc = this.worldToScreen(dir);
        // this.#ctx.fillRect(cSc.x-25, cSc.y-25, 50, 50);

        const ooftSign = (n) => {
            return n > 0 ? 1 : -1;
        }

        dir.x -= localPosition.x;
        dir.y -= localPosition.y;
        dir = new vec(ooftSign(dir.x / 128), ooftSign(dir.y / 128));

        var chunksRendered = 0;

        for (let x = 0; Math.abs(x) <= Math.abs(dir.x); x += ooftSign(dir.x)) {
            for (let y = 0; Math.abs(y) <= Math.abs(dir.y); y += ooftSign(dir.y)) {
                let _chank = this.#app.ChunkData.get(chunkPos.x - x, chunkPos.y - y);
                if (_chank instanceof Chunk) {
                    let cSP = this.worldToScreen(_chank.chunkPosition.multiply(256).add(new vec(256, 0)));
                    this.#ctx.drawImage(texture_chunk, cSP.x, cSP.y, (16 * 10 * 16), (16 * 10 * 16));
                }
            }
        }

        for (let x = 0; Math.abs(x) <= Math.abs(dir.x); x += ooftSign(dir.x)) {
            for (let y = 0; Math.abs(y) <= Math.abs(dir.y); y += ooftSign(dir.y)) {
                let _chank = this.#app.ChunkData.get(chunkPos.x - x, chunkPos.y - y);
                if (_chank instanceof Chunk) {
                    _chank.worldBlocks.forEach(wb => {
                        const tex = Textures.getTexture(wb.texture);
                        let screenPosition = this.worldToScreen(new vec(wb.position.x + 16, wb.position.y).add(_chank.chunkPosition.multiply(256)));
                        if (screenPosition.x > -tex.width * 20 && screenPosition.x < this.#app.renderer.width && screenPosition.y > -tex.height * 20 && screenPosition.y < this.#app.renderer.height + (tex.height - 16) * 10) {
                            if (!wb.isSolid) {
                                this.#ctx.fillStyle = '#33333366';
                                this.#ctx.beginPath();
                                this.#ctx.ellipse(screenPosition.x + 16 * 5, screenPosition.y + 16 * 9, 16 * 3, 16 * 1, 0, 0, Math.PI * 2);
                                this.#ctx.fill();
                                this.#ctx.closePath();
                            }
                            this.#ctx.drawImage(tex, screenPosition.x + (8 - tex.width / 2) * 10, screenPosition.y + (16 - tex.height) * 10, (tex.width * 10), (tex.width * 10));
                            // this.#ctx.strokeStyle = '#ff0000';
                            // this.#ctx.strokeRect(screenPosition.x, screenPosition.y, wb.scale.x * 10, wb.scale.y * 10);
                        }
                    });
                    chunksRendered++;
                }
            }
        }

        document.getElementById('debug').innerText += `\ndir ${dir}`;

        // this.#ctx.fillStyle = '#0000ff55';
        // let cSc = this.#worldToScreen(chunkPos.multiply(256));
        // this.#ctx.fillRect(cSc.x, cSc.y, 2560, 2560);
        this.#ctx.fillStyle = 'white';

        document.getElementById('debug').innerText += `\nChunk ${chunkPos}`;
        document.getElementById('debug').innerText += `\nChunks rendered ${chunksRendered}`;
    }
}