import vec from "../vec.js";

export default class WorldBlock {
    position = new vec(0, 0);
    texture="none";
    scale = new vec(1, 1);

    constructor(data) {
        if (data === undefined) return this;
        if ("position" in data && data.position instanceof vec) this.position = data.position;
        if ("scale" in data && data.scale instanceof vec) this.scale = data.scale;
        if ("texture" in data) this.texture = data.texture;
    }
}