import BiHashMap from "./classes/BiHashMap.js";

const hash = new BiHashMap();

hash.set(1, 2, "aa");
hash.set(2, 3, "nnn");

console.log(JSON.stringify(hash));