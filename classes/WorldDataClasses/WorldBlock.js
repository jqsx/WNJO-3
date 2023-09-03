import vec from "../vec.js";

export default class WorldBlock {
    position = new vec(0, 0);
    texture="none";
    scale = new vec(1, 1);
    maxHealth = 100;
    health = 100;
    defense = 0;
    isSolid = true;

    constructor(data) {
        if (data === undefined) return this;
        if ("position" in data && data.position instanceof vec) this.position = data.position;
        if ("scale" in data && data.scale instanceof vec) this.scale = data.scale;
        if ("texture" in data) this.texture = data.texture;
        if ("isSolid" in data) this.isSolid = data.isSolid;
        if ("health" in data) this.health = data.health;
        if ("maxHealth" in data) this.maxHealth = data.maxHealth;
        if ("defense" in data) this.defense = data.defense;
    }
}