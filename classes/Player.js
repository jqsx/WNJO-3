import vec from "./vec.js";

export default class Player {
    id=0;
    name="";
    position = new vec(0,0);
    constructor(playerData) {
        this.id = "id" in playerData ? playerData["id"] : Math.random();
        this.position = "position" in playerData && playerData["position"] instanceof vec ? new vec(playerData["position"].x, playerData["position"].y) : this.position;
        this.name = "name" in playerData ? playerData["name"] : this.name;
    }

    toString() {
        return JSON.stringify(this);
    }

    compare(other) {
        return other.id == this.id;
    }
}