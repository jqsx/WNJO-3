import App from "../classes/app.js";

const setup = () => {
    const dataDisplay = document.getElementById('ld');
    const app = new App();

    document.body.appendChild(app.renderer);

    dataDisplay.innerText = 'Loading...';

    document.getElementById('LIB').addEventListener('click', () => app.AccountRetrieval("login"));
    document.getElementById('CB').addEventListener('click', () => app.AccountRetrieval("create"));

    // load anything before that
    // such as map or stuff
    
    dataDisplay.parentElement.style.display = 'none';
    app.start();
}

setup();