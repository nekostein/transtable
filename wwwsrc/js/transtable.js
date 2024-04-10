const app = {
    config: {},
    RAM: {
        dirty_cells_map: {}
    },
    utils: {},
    dom: {}
};




app.utils.parseQuery = function () {
    const arr = location.search.slice(1).split('&');
    let map = {};
    arr.forEach(function (x) {
        const line_arr = x.split('=');
        map[line_arr[0]] = line_arr.slice(1).join('=');
    })
    return map;
};

app.utils.parseCsv = function (raw_text) {
    const clean_text = raw_text.trim().replace(/\n\n+/g, '\n'); // Single LF
    const lines_arr = clean_text.split('\n');
    const metadata = {
        languages: lines_arr[0].split(';').slice(1)
    };
    const matrix = lines_arr.slice(1).map(function (line) {
        let current = '';
        let inQuotes = false;
        let rowData = [];
        line.split('').forEach(function (char) {
            if (char === '"' && !inQuotes) {
                inQuotes = true;
                current += char;
            } else if (char === '"' && inQuotes) {
                inQuotes = false;
                current += char;
            } else if (char === app.config.delimiter && !inQuotes) {
                rowData.push(current.trim().replace(/^\"/, '').replace(/\"$/, ''));
                current = '';
            } else {
                current += char;
            };
        });
        rowData.push(current.trim().replace(/^\"/, '').replace(/\"$/, ''));
        return rowData;
    });
    return { matrix, metadata };
};







app.boot = function () {
    const xhr = new XMLHttpRequest();
    xhr.open('get', 'config.json');
    xhr.onload = app.preInit;
    xhr.send();
};

app.preInit = function (ev) {
    console.log('ev.target.responseText');
    console.log(ev.target.responseText);
    app.config = JSON.parse(ev.target.responseText);
    app.init();
};

app.init = function () {
    app.RAM.mainDom = document.querySelector('#js-appMain');
    app.loadCsv();
};

app.loadCsv = function () {
    const xhr = new XMLHttpRequest();
    app.RAM.parsedQuery = app.utils.parseQuery();
    if (app.RAM.parsedQuery.csv) {
        // CSV path is given
        xhr.open('get', `./files/${app.RAM.parsedQuery.csv}`);
        xhr.onload = function (ev) {
            app.afterCsvLoad(xhr.responseText);
            
        };
        xhr.send();
    } else {
        app.showIndex();
    };
};

app.afterCsvLoad = function (responseText) {
    document.querySelector('#js-subtitle').innerHTML = `Now editing: <code>${app.RAM.parsedQuery.csv}</code>`;
    app.RAM.csv_data = app.utils.parseCsv(responseText);
    console.log(app.RAM.csv_data);

    document.querySelector('#app-mainTable').innerHTML = '';

    let tableHtml = `<table>
        <tbody>
            ${app.renderTableHead()}
            ${app.renderTableBody()}
        </tbody>
    </table>`;
    document.querySelector('#app-mainTable').innerHTML += tableHtml;
    document.querySelectorAll('.transtable-edit-cell').forEach(function (node) {
        node.setAttribute('contenteditable', 'true');
        node.addEventListener('input', app.dom.cellInputEventHandler);
    });
    document.querySelectorAll('.button-clear-cell').forEach(function (node) {
        node.addEventListener('click', app.dom.clearButtonEventHandler);
    });
    app.dom.flushModifList();
};

app.showIndex = function () {

};

app.renderTableHead = function () {
    return `<tr>
        <th>Keys</th>
        ${app.RAM.csv_data.metadata.languages.map(x => `<th>${x}</th>`).join('')}
    </tr>`;
};

app.renderTableBody = function () {
    return app.RAM.csv_data.matrix.map(function (row) {
        const key = row[0];
        return `<tr>` + row.map(function (column, i) {
            let lang = 'NULL';
            if (i > 0) {
                lang = app.RAM.csv_data.metadata.languages[i - 1]
            };
            const cell_identifier = `${lang}:${key}`
            const cell_content = ([
                column,
                `<input
                    data-identifier="${cell_identifier}"
                    data-key="${key}"
                    data-lang="${lang}"
                    data-original-text="${column}"
                    class="transtable-edit-cell"
                    value="${column}"
                /><button class="button-clear-cell" data-for="${cell_identifier}">X</button>`
            ])[lang === 'NULL' ? 0 : 1];
            return `<td>${cell_content}</td>`;
        }).join('') + `</tr>`;
    }).join('');
};








app.dom.cellInputEventHandler = function (ev) {
    console.log('ev');
    console.log(ev);
    const node = ev.target;
    app.RAM.dirty_cells_map[node.getAttribute('data-identifier')] = true;
    const is_dirty = node.value.trim() !== node.getAttribute('data-original-text').trim();
    node.setAttribute('data-dirty', is_dirty ? 'true' : 'false');
    app.dom.flushModifList();
};

app.dom.clearButtonEventHandler = function (ev) {
    const button = ev.target;
    const id = button.getAttribute('data-for');
    const input = document.querySelector(`.transtable-edit-cell[data-identifier="${id}"]`);
    input.value = input.getAttribute('data-original-text');
    input.setAttribute('data-dirty', 'false');
    app.RAM.dirty_cells_map[id] = false;
    app.dom.flushModifList();
};

app.dom.flushModifList = function () {
    const node = document.querySelector('#js-changeList');
    node.value = Object.keys(app.RAM.dirty_cells_map).filter(function (id) {
        const input = document.querySelector(`.transtable-edit-cell[data-identifier="${id}"]`);
        return input.getAttribute('data-dirty') == 'true';
    }).map(function (id) {
        return id + ':' + document.querySelector(`.transtable-edit-cell[data-identifier="${id}"]`).value;
    }).join('\n');
};

app.dom.exportFullCsv = function () {
    let output_text = '';
    output_text += 'keys' + app.config.delimiter + app.RAM.csv_data.metadata.languages.join(app.config.delimiter) + '\n\n';
    output_text += app.RAM.csv_data.matrix.map(function (row, row_index) {
        const key = row[0];
        return row[0] + app.config.delimiter + row.slice(1).map(function (col, col_id) {
            const lang = app.RAM.csv_data.metadata.languages[col_id];
            const cell_id = lang + ':' + key;
            return '"' + document.querySelector(`.transtable-edit-cell[data-identifier="${cell_id}"]`).value.trim() + '"';
        }).join(app.config.delimiter);
    }).join('\n');
    console.log('output_text = ');
    console.log(output_text);
    document.querySelector('#js-exportedCsv').value = output_text;
    document.querySelector('#js-exportedCsv').select();
};
