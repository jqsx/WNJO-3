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
        return Textures.#textures.get(name);
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
        name: "player-idle",
        src: "player/playeridle.png"
    }
]