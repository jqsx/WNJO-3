import BiHashMap from "../BiHashMap";
import vec from "../vec.js";

export default class Chunk {
    chunkPosition = new vec(0, 0);
    worldBlocks = new BiHashMap();
    
    constructor(position, data) {
        if (position !== undefined && position instanceof vec) this.chunkPosition = position;
        if (data !== undefined) this.worldBlocks = new BiHashMap(data);
    }
}