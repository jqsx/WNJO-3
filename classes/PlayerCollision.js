import App from "./app.js";
import Chunk from "./WorldDataClasses/Chunk.js";
import vec from "./vec.js";
import { DEBUG } from "./DEBUG.js";

export class PlayerCollision {
    app;
    constructor(app) {
        if (app instanceof App) {
            this.app = app;
        }
    }

    updateCollisions() {
        let col = this.collisionCheck();
        if (col !== null) {
            let localPlayer = this.app.localPlayer;
            let campos = this.app.cameraPosition;
            let wbpos = col.chunk.chunkPosition.multiply(256).add(col.wb.position).add(new vec(col.wb.scale.x / 2, col.wb.scale.y / 2));
            let diff = wbpos.sub(localPlayer.position)

            if (Math.abs(diff.x) > Math.abs(diff.y)) {
                localPlayer.position.y += diff.y;
            }
            else {
                localPlayer.position.x += diff.x;
            }

            campos.x = localPlayer.position.x;
            campos.y = localPlayer.position.y;
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
                    for (let i = 0; i < _chank.worldBlocks.length; i++) {
                        const wb = _chank.worldBlocks[i];
                        if (!wb.isSolid) continue;
                        if (localPlayer.position.distance(_chank.chunkPosition.multiply(256).add(new vec(wb.position.x + 16, wb.position.y))) < 16  + Math.max(wb.scale.x, wb.scale.y)) {
                            if (this.rectIntersect(wb, _chank)) {
                                j++;
                                return { wb: wb, chunk: _chank };
                            }
                            i++;
                        }
                    }
                }
            }
        }
        return null;
    }

    rectIntersect(worldBlock, chunk) {
        if (!worldBlock.isSolid) return;
        let localPlayer = this.app.localPlayer;

        let chunkWorldPos = chunk.chunkPosition.multiply(256);
        let actual = new vec(worldBlock.position.x + 16 ,worldBlock.position.y).add(chunkWorldPos);
        // DEBUG.debugPoint(actual);
        // DEBUG.debugPoint(test);
        // DEBUG.debugPoint(localPlayer.position);

        // let relativeToChunk = localPlayer.position.sub(chunk.chunkPosition.multiply(256));
        // if (relativeToChunk.x < -35 || relativeToChunk.x > 256 + 35 + worldBlock.scale.x || relativeToChunk.y < -55 || relativeToChunk.y > 256 + 55 + worldBlock.scale.y) return false;
        
        let a = localPlayer.position.multiply(-1);
        let b = actual.multiply(-1);

        // DEBUG.debugLine(a, b);

        let x = a.x + 3.5 > b.x + worldBlock.scale.x && a.x - 3.5 < b.x + worldBlock.scale.x;
        // a.x - 3.5 < b.x && a.x + 3.5 > b.x - worldBlock.scale.x;
        let y = a.y + 5.5 > b.y + worldBlock.scale.y && a.y - 5.5 < b.y + worldBlock.scale.y;
        //a.y - 5.5 < b.y && a.y + 5.5 > b.y - worldBlock.scale.y;

        // DEBUG.debugLine(new vec(a.x, b.y), b);

        return x && y;
    }
}