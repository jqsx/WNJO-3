export default class Textures {
    static #textures = new Map();
    static instance;

    static initializeImages() {
        imageData.forEach(value => {
            let img = new Image();
            img.src = `../client/src/${value.src}`;
            Textures.#textures.set(value.name, img);
        });
    }

    static getTexture(name) {
        let tex = Textures.#textures.get(name);
        if (tex === undefined) {
            return Textures.#textures.get("none");
        }
        return tex;
    }
}

const imageData = [
    {
        name: "none",
        src: "none.png"
    },
    {
        name: "block",
        src: "block.png"
    },
    {
        name: "stone",
        src: "stone.png"
    },
    {
        name: "player-idle",
        src: "player/playeridle.png"
    },
    {
        name: "chunk",
        src: "chunker.png"
    },
    {
        name: "tree",
        src: "tree.png"
    },
    {
        name: "shortgrass",
        src: "shortgrass.png"
    },
    {
        name: "smalltree",
        src: "smalltree.png"
    },
    {
        name: "mushroom",
        src: "mashroom.png"
    }
]

const tileTextureData = [
    {
        name: "Player",
        src: "bing",
        h: 16,
        w: 16
    }
]