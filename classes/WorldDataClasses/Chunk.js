import BiHashMap from "../BiHashMap.js";
import vec from "../vec.js";

export default class Chunk {
    chunkPosition = new vec(0, 0);
    biome= "forest";
    worldBlocks = [];
    
    constructor(position, data) {
        if (position !== undefined && position instanceof vec) this.chunkPosition = position;
        if (data !== undefined) this.worldBlocks = data;
    }
}