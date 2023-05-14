import Chunk from "../classes/WorldDataClasses/Chunk.js";
import App from "../classes/app.js";
import vec from "../classes/vec.js";

const setup = async () => {
    const dataDisplay = document.getElementById('ld');
    const app = new App();

    document.body.appendChild(app.renderer);

    dataDisplay.innerText = 'Loading...';

    document.getElementById('LIB').addEventListener('click', () => app.AccountRetrieval("login"));
    document.getElementById('CB').addEventListener('click', () => app.AccountRetrieval("create"));

    try {
        // load anything before that
        // such as map or stuff

        // loading server chunks
        const fetchChunkData = async () => {
            dataDisplay.innerText = "Fetching chunks...";
            const worlddata = await fetch('/worlddata', {method: "GET"});
            dataDisplay.innerText = "Loading chunks...";
            const json = await worlddata.json();
            var i = 0;
            json.forEach(value => { // generate local chunk data
                app.ChunkData.set(value.chunkPosition.x, value.chunkPosition.y, new Chunk(new vec(value.chunkPosition.x, value.chunkPosition.y), value.worldBlocks));
                i++;
                dataDisplay.innerText = `Chunks Loaded (${i} / ${json.length})`;
            });
            dataDisplay.innerText = "Loaded chunks!"
        }
        await fetchChunkData();
    } catch (e) {
        dataDisplay.style.color = 'red';
        dataDisplay.innerText = `Error Loading Game Data.\n${e}\n\nIf you think wasn't meant to happen please report the error to the developers.`
        return;
    }

    dataDisplay.parentElement.style.display = 'none';
    app.start();
};
setup();
