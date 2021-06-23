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
            console.log('Event Logged');
            alert('Submitted');
        });
}

function submitForm(event, date, time) {
    if(event == "" || event == null) return;
    if(date == "" || date == null) return;
    if(time == "" || time == null) return;

    const id = uuidv4();

    // https://firebase.google.com/docs/firestore/manage-data/add-data#web-v8
    db.collection("timecard").doc(id).set({event, date, time})
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
    });

    // var data = {
    //     'entry.1767489953': id,
    //     'entry.173797170': event,
    //     'entry.1820923996': date,
    //     'entry.1826000596': time,
    // };

    // TODO: Send to Firestore. Use Google Sheets as a backup.
    // sendToGoogleSheets(formURL, data);
}

const formURL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdJGyMq--4-WRQ7vuVM9soMf86vXiB2O8LK4m_oa38-_weefA/formResponse',
    date = document.querySelector('input[type=date]'),
    time = document.querySelector('input[type=time]'),
    now = new Date();

date.value = `${
        now.getFullYear()
    }-${
        (now.getMonth() + 1).toString().padStart(2, 0)
    }-${
        now.getDate().toString().padStart(2, 0)
    }`;

time.value = `${
        now.getHours().toString().padStart(2, 0)
    }:${
        now.getMinutes().toString().padStart(2, 0)
    }`;

document.querySelector('#submit').addEventListener('click', function() {
    const event = [...document.querySelectorAll('input[name=event]')]
        .find(radio => radio.checked);

    if(event == null) return;

    submitForm(event.value, date.value, time.value);
});