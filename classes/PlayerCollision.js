import App from "./app.js";
import Chunk from "./WorldDataClasses/Chunk.js";
import vec from "./vec.js";

export class PlayerCollision {
    app;
    constructor(app) {
        if (app instanceof App) {
            this.app = app;
        }
    }

    collisionCheck() {
        let localPlayer = this.app.localPlayer;
        let chunkPos = new vec(Math.floor(localPlayer.position.x / (256)), Math.floor(localPlayer.position.y / (256))); 
        var dir = new vec(chunkPos.x * 256 + 128, chunkPos.y * 256 + 128);
        const ooftSign = (n) => {
            return n > 0 ? 1 : -1;
        }

        dir.x -= localPlayer.position.x;
        dir.y -= localPlayer.position.y;
        dir = new vec(ooftSign(dir.x / 128), ooftSign(dir.y / 128));

        var i = 0;
        for (let x = 0; Math.abs(x) <= Math.abs(dir.x); x += ooftSign(dir.x)) {
            for (let y = 0; Math.abs(y) <= Math.abs(dir.y); y += ooftSign(dir.y)) {
                let _chank = this.app.ChunkData.get(chunkPos.x - x, chunkPos.y - y);
                if (_chank instanceof Chunk) {
                    _chank.worldBlocks.forEach(wb => {
                        if (!wb.isSolid) return;
                        if (localPlayer.position.distance(wb.position) < 11 + Math.max(wb.scale.x, wb.scale.y)) {
                            if (this.rectIntersect(wb, _chank)) return true;
                            i++;
                        }
                    })
                }
            }
        }
        document.getElementById('debug').innerText += "\nwb count: " + i;
        return false;
    }

    rectIntersect(worldBlock, chunk) {
        if (!worldBlock.isSolid) return;
        let localPlayer = this.app.localPlayer;

        let wbpos = new vec(worldBlock.position.x + chunk.chunkPosition.x * 256, worldBlock.position.y + chunk.chunkPosition.y * 256)

        let x = localPlayer.position.x + 70 > wbpos.x && localPlayer.position.x - 35 < wbpos.x + worldBlock.scale.x * 10;
        let y = localPlayer.position.y + 110 > wbpos.y && localPlayer.position.y - 55 < wbpos.y + worldBlock.scale.y * 10;

        return x && y;
    }
}