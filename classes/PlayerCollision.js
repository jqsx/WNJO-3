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

    updateCollisions(lastMove) {
        let col = this.collisionCheck();
        if (col !== null) {
            let localPlayer = this.app.localPlayer;
            localPlayer.position.x += lastMove.x;
            localPlayer.position.y += lastMove.y;
            // let campos = this.app.cameraPosition;
            // let wbpos = col.chunk.chunkPosition.multiply(256).add(col.wb.position).add(new vec(col.wb.scale.x / 2, col.wb.scale.y / 2));
            // // let diff = wbpos.add(new vec(-col.wb.scale.x / 2, col.wb.scale.y / 2)).sub(localPlayer.position);
            // let wbCentered = wbpos.add(new vec(-col.wb.scale.x / 2, col.wb.scale.y / 2));

            // let diff = wbCentered.sub(localPlayer.position);
            // let gap = diff.sub(new vec(-col.wb.scale.x / 2, col.wb.scale.y / 2));

            // const determineDisplacement = (gap, playerDimension, targetDimension) => {
            //     let min = gap;

            //     const other = gap + playerDimension + targetDimension;
            //     if (other < Math.abs(min)) min = other;

            //     return min;
            // };

            // let displacement = new vec(determineDisplacement(gap.x, 7, col.wb.scale.x), determineDisplacement(gap.y, 11, col.wb.scale.y));
            // DEBUG.log("bing: " + displacement);
            // if (Math.abs(displacement.y) > Math.abs(displacement.x)) {
            //     localPlayer.position.y -= displacement.y / (col.wb.scale.y / 2);
            //     DEBUG.log("disp y");
            // } else {
            //     DEBUG.log("disp x");
            //     localPlayer.position.x -= displacement.x / (col.wb.scale.x / 2);
            // }
        }
    }

    collisionCheck() {
        let localPlayer = this.app.localPlayer;
        let chunkPos = new vec(
            Math.floor(localPlayer.position.x / 256),
            Math.floor(localPlayer.position.y / 256)
        );
        var dir = new vec(chunkPos.x * 256 + 128, chunkPos.y * 256 + 128);
        const ooftSign = (n) => {
            return n > 0 ? 1 : -1;
        };

        dir.x -= localPlayer.position.x;
        dir.y -= localPlayer.position.y;
        dir = new vec(ooftSign(dir.x / 128), ooftSign(dir.y / 128));
        for (let x = 0; Math.abs(x) <= Math.abs(dir.x); x += ooftSign(dir.x)) {
            for (let y = 0; Math.abs(y) <= Math.abs(dir.y); y += ooftSign(dir.y)) {
                let _chank = this.app.ChunkData.get(chunkPos.x - x, chunkPos.y - y);
                if (_chank instanceof Chunk) {
                    for (let i = 0; i < _chank.worldBlocks.length; i++) {
                        const wb = _chank.worldBlocks[i];
                        if (!wb.isSolid) continue;
                        if (
                            localPlayer.position.distance(
                                _chank.chunkPosition
                                    .multiply(256)
                                    .add(new vec(wb.position.x + 8, wb.position.y + 8))
                            ) <
                            16 + Math.max(wb.scale.x, wb.scale.y)
                        ) {
                            if (this.rectIntersect(wb, _chank)) {
                                return { wb: wb, chunk: _chank };
                            }
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
        let actual = new vec(worldBlock.position.x, worldBlock.position.y).add(
            chunkWorldPos
        );
        // DEBUG.debugPoint(actual);
        // DEBUG.debugPoint(test);
        // DEBUG.debugPoint(localPlayer.position);

        // let relativeToChunk = localPlayer.position.sub(chunk.chunkPosition.multiply(256));
        // if (relativeToChunk.x < -35 || relativeToChunk.x > 256 + 35 + worldBlock.scale.x || relativeToChunk.y < -55 || relativeToChunk.y > 256 + 55 + worldBlock.scale.y) return false;

        let a = localPlayer.position;
        let b = actual.add(new vec(0, 0));

        // DEBUG.debugLine(localPlayer.position, actual);

        let x = a.x + 3.5 > b.x && a.x - 3.5 - worldBlock.scale.x < b.x;
        // a.x - 3.5 < b.x && a.x + 3.5 > b.x - worldBlock.scale.x;
        let y = a.y + 5.5 > b.y && a.y - 5.5 - worldBlock.scale.y < b.y;
        //a.y - 5.5 < b.y && a.y + 5.5 > b.y - worldBlock.scale.y;

        // DEBUG.debugLine(new vec(a.x, b.y), b);

        // if (y) {
        //     DEBUG.debugLine(localPlayer.position, actual.add(new vec(16, 0)));
        // }
        return x && y;
    }
}
