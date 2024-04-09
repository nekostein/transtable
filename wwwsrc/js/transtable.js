const app = {
    config: {},
    RAM: {},
};


app.boot = function () {
    const xhr = new XMLHttpRequest();
    xhr.open('get', 'config.json');
    xhr.onload = app.preInit;
    xhr.send();
};

app.preInit = function (ev) {
    app.config = JSON.parse(ev.responseText);
    app.init();
};

app.init = function () {
    
};
