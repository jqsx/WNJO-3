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
        var j= 0;
        for (let x = 0; Math.abs(x) <= Math.abs(dir.x); x += ooftSign(dir.x)) {
            for (let y = 0; Math.abs(y) <= Math.abs(dir.y); y += ooftSign(dir.y)) {
                let _chank = this.app.ChunkData.get(chunkPos.x - x, chunkPos.y - y);
                if (_chank instanceof Chunk) {
                    _chank.worldBlocks.forEach(wb => {
                        if (!wb.isSolid) return;
                        if (localPlayer.position.distance(chunkPos.multiply(256).add(wb.position)) < 11 + Math.max(wb.scale.x, wb.scale.y)) {
                            if (this.rectIntersect(wb, _chank)) {
                                j++;
                            }
                            i++;
                        }
                    })
                }
            }
        }
        document.getElementById('debug').innerText += "\nwb count: " + i;
        document.getElementById('debug').innerText += "\nwb collided count: " + j;
        return false;
    }

    rectIntersect(worldBlock, chunk) {
        if (!worldBlock.isSolid) return;
        let localPlayer = this.app.localPlayer;

        let relativeToChunk = localPlayer.position.sub(chunk.chunkPosition.multiply(256));
        document.getElementById('debug').innerText += `\nrel: ${relativeToChunk.toString()}`;
        // if (relativeToChunk.x < -35 || relativeToChunk.x > 256 + 35 + worldBlock.scale.x || relativeToChunk.y < -55 || relativeToChunk.y > 256 + 55 + worldBlock.scale.y) return false;
        
        let a = relativeToChunk;
        let b = worldBlock.position;

        let x = a.x + 35 < b.x && a.x - 35 > b.x + worldBlock.scale.x;
        let y = a.y + 55 < b.y && a.y - 55 > b.y + worldBlock.scale.y;

        return x && y;
    }
}