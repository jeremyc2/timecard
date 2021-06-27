function uuidv4() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function stringifyFormData(data) {
    return Object.entries(data).reduce((accumulator, currentValue) => {
        if(typeof accumulator === 'object') {
            return `${accumulator.join('=')}&${currentValue.join('=')}`;
        } else {
            return `${accumulator}&${currentValue.join('=')}`;
        }
    });
}

function sendToGoogleSheets(url, data) {
    return fetch(url, {
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            body: stringifyFormData(data),
            method: 'POST',
            mode: 'no-cors'
        }).then(() => {
            console.log("Document successfully written!");
            alert('Timecard Updated');
        });
}