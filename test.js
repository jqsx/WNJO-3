import { createNoise2D } from "simplex-noise";

const noise = createNoise2D(() => 1234);

for (let x = 0; x < 100; x++) {
    for (let y = 0; y < 100; y++) {
        console.log(noise(x/ 10.0, y / 10.0));
    }
}