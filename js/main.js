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

function submitForm(event, date, time) {
    if(event == "" || event == null) return;
    if(date == "" || date == null) return;
    if(time == "" || time == null) return;

    const id = uuidv4();

    // https://firebase.google.com/docs/firestore/manage-data/add-data#web-v8
    db.collection("timecard").doc(id).set({event, date, time})
    .then(() => {
        console.log("Document successfully written!");
        alert('Timecard Updated');
    })
    .catch((error) => {

        console.error("Error writing document: ", error);

        // TODO: Use Google Sheets as a backup.

        // var data = {
        //     'entry.1767489953': id,
        //     'entry.173797170': event,
        //     'entry.1820923996': date,
        //     'entry.1826000596': time,
        // };

        // sendToGoogleSheets(formURL, data);
    });
}

class Timesheet {

    table;
    currentRow;

    constructor() {
        this.table = document.createElement('table');

        this.appendRow(true);

        this.currentRow.date.innerText = 'Date';
        this.currentRow.clockIn.innerText = 'Clock-In';
        this.currentRow.clockOut.innerText = 'Clock-Out';
        this.currentRow.duration.innerText = 'Duration';
        this.currentRow.wages.innerText = 'Wages';
    }

    appendRow(isHeader) {
        const tr = document.createElement('tr');

        var cellType;
        if(isHeader) {
            cellType = 'th';
        } else {
            cellType = 'td'
        }
            
        const date = document.createElement(cellType),
            clockIn = document.createElement(cellType),
            clockOut = document.createElement(cellType),
            duration = document.createElement(cellType),
            wages = document.createElement(cellType);

        tr.append(date, clockIn, clockOut, duration, wages);
        this.table.appendChild(tr);

        this.currentRow = {date, clockIn, clockOut, duration, wages};
    }

    clockIn(id = '', date = '', time = '') {
        this.appendRow();

        this.currentRow.clockIn.setAttribute('data-id', id);
        this.currentRow.clockIn.setAttribute('data-date', date);
        this.currentRow.date.innerText = date;
        this.currentRow.clockIn.innerText = time;
    }

    clockOut(id = '', date = '', time = '') {

        if(this.currentRow.date.innerText == '') {
            this.currentRow.date.innerText = date;
        }

        this.currentRow.clockOut.setAttribute('data-id', id);
        this.currentRow.clockOut.setAttribute('data-date', date);
        this.currentRow.clockOut.innerText = time;
        // TODO calculate duration and wages
    }

    export() {
        return this.table;
    }
}

function showTimesheet() {
    var clockedIn = false;
    db.collection("timecard").orderBy("date").orderBy("time").get().then(querySnapshot => {
        var timesheet = new Timesheet();
        querySnapshot.forEach(entry => {
            const id = entry.id,
                data = entry.data();

            if(clockedIn) {
                if(data.event == "Clock-In") {
                    // Input empty clock-out
                    timesheet.clockOut();
                    // Input clock-in
                    timesheet.clockIn(id, data.date, data.time);
                    clockedIn = true;
                } else if(data.event == "Clock-Out") {
                    // Input clock-out
                    timesheet.clockOut(id, data.date, data.time);
                    clockedIn = false;
                }
            } else {
                if(data.event == "Clock-In") {
                    // Input clock-in
                    timesheet.clockIn(id, data.date, data.time);
                    clockedIn = true;
                } else if(data.event == "Clock-Out") {
                    // Input empty clock-in
                    timesheet.clockIn();
                    // Input clock-out
                    timesheet.clockOut(id, data.date, data.time);
                    clockedIn = false;
                }
            }
        });
        table.innerHTML = '';
        table.appendChild(timesheet.export());
        document.body.classList.add('display-table');
    });
}

function hideTimesheet() {
    table.innerHTML = '';
    document.body.classList.remove('display-table');
}

const formURL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdJGyMq--4-WRQ7vuVM9soMf86vXiB2O8LK4m_oa38-_weefA/formResponse',
    date = document.querySelector('input[type=date]'),
    time = document.querySelector('input[type=time]'),
    table = document.querySelector('body > .table'),
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
