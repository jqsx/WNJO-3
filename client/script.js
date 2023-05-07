import App from "../classes/app.js";

const setup = () => {
    const dataDisplay = document.getElementById('ld');
    const app = new App();

    document.body.appendChild(app.renderer);

    dataDisplay.innerText = 'Loading...';

    // load anything before that
    // such as map or stuff

    

    app.start();
}

setup();