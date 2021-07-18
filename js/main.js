async function showModal(id, message) {
    const modalContent = document.querySelector(`#modal-${id}-content`),
        continueButton = document.querySelector(`#modal-${id}-continue-btn`),
        cancelButton = document.querySelector(`#modal-${id}-cancel-btn`);

    modalContent.innerHTML = message;

    var proceed;

    MicroModal.show(`modal-${id}`, {onClose: () => {
            if(typeof proceed === 'undefined') {
                proceed = false;
            }
        }
    });

    if(continueButton) {
        continueButton.addEventListener('click', () => {
            proceed = true;
            MicroModal.close(`modal-${id}`);
        });
    }

    cancelButton.addEventListener('click', () => {
        proceed = false;
        MicroModal.close(`modal-${id}`);
    });

    return new Promise((resolve) => {
        var interval = setInterval(() => {
            if(proceed) {
                resolve(true);
                clearInterval(interval);
            } else if(proceed === false) {
                resolve(false);
                clearInterval(interval);
            }
        }, 10);
    });
}

async function confirm(message) {
    var response = await showModal(1, message);
    return response;
}

async function alert(message) {
    await showModal(2, message);
}

function selectEvent(eventLabel) {
    var currentlySelected = document.querySelector('.selected-event');

    if(currentlySelected) {
        currentlySelected.classList.remove('selected-event');
    }
    
    eventLabel.classList.add('selected-event');
}

async function submitForm(event, date, time) {
    if(event == "" || event == null) {
        alert('You must select either <b>Check-In</b> or <b>Check-Out</b>.');
        return;
    };
    if(date == "" || date == null)  {
        alert(`You must select a date.`);
        return;
    };
    if(time == "" || time == null)  {
        alert(`You must select a time.`);
        return;
    };
    
    var proceed = await confirm(`${
            event == 'Clock-In'? 'Clock in': 'Clock out'
        } <b>${
            convertTo12HourTime(time, false)
        }</b><br />${
            expandDatestring(date)
        }`);

    if(!proceed) return;

    const id = uuidv4();

    // https://firebase.google.com/docs/firestore/manage-data/add-data#web-v8
    db.collection("timecard").doc(id).set({
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        event,
        date, 
        time
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {

        console.error("Error writing document: ", error);

        var data = {
            'entry.1767489953': id,
            'entry.173797170': event,
            'entry.1820923996': date,
            'entry.1826000596': time,
        };

        sendToGoogleSheets(formURL, data);
    });
}

function convertHoursToPay(hours) {
    return `$${(hours * wage).toFixed(2)}`;
}

function buildTables() {
    var isFirst = true;
    for (let [week, days] of [...timesheet.weeks].reverse()) {
        const weekTable = document.createElement('table'),
            titleRow = document.createElement('tr'),
            tableTitle = document.createElement('th'),
            headerRow = document.createElement('tr'),
            headerDay = document.createElement('th'),
            headerClockIn = document.createElement('th'),
            headerClockOut = document.createElement('th'),
            headerDuration = document.createElement('th'),
            expandToggle = document.createElement('div');

        var totalDuration = 0;

        tableTitle.setAttribute('colspan', 4);
        tableTitle.innerText = week;

        headerDay.innerText = 'Date';
        headerClockIn.innerText = 'Clock-In';
        headerClockOut.innerText = 'Clock-Out';
        headerDuration.innerText = 'Duration';

        if(isFirst) {
            weekTable.classList.add('table-expanded');
            isFirst = false;
        } else {
            weekTable.classList.add('table-collapsed');
        }

        expandToggle.classList.add('toggle-expand');

        titleRow.addEventListener('click', () => {
            if(weekTable.classList.contains('table-collapsed')) {
                weekTable.classList.remove('table-collapsed');
                weekTable.classList.add('table-expanded');
            } else {
                weekTable.classList.remove('table-expanded');
                weekTable.classList.add('table-collapsed');  
            }
        });

        titleRow.append(tableTitle, expandToggle);
        weekTable.append(titleRow);

        headerRow.append(headerDay, headerClockIn, headerClockOut, headerDuration);
        weekTable.append(headerRow);
        timecard.append(weekTable);

        var row, tdDay, tdClockIn, tdClockOut, tdDuration, clockIn, clockOut;

        for(let [day, data] of days) {
            data.forEach(({id, event, time}) => {
                if(event == "Clock-In") {

                    clockOut = undefined;

                    row = document.createElement('tr');
                    tdDay = document.createElement('td');
                    tdClockIn = document.createElement('td');
                    tdClockOut = document.createElement('td');
                    tdDuration = document.createElement('td');

                    row.append(tdDay, tdClockIn, tdClockOut, tdDuration);
                    weekTable.append(row);
    
                    tdDay.innerHTML = expandDatestring(day, true);

                    if(time != null) {
                        var clockInDay = day.split('-').map(x => parseInt(x)),
                            clockInTime = time.split(':').map(x => parseInt(x));

                        clockIn = new Date(clockInDay[0], clockInDay[1] - 1, 
                            clockInDay[2], clockInTime[0], clockInTime[1]);

                        tdClockIn.setAttribute('data-id', id);
                        tdClockIn.innerText = convertTo12HourTime(time);

                    } else {
                        clockIn = undefined;
                    }
                } else if(event == "Clock-Out") {
                    if(time != null) {

                        if(typeof clockIn === 'undefined') {
                            tdDay.innerHTML = expandDatestring(day, true);
                        }

                        var clockOutDay = day.split('-').map(x => parseInt(x)),
                            clockOutTime = time.split(':').map(x => parseInt(x));

                        clockOut = new Date(clockOutDay[0], clockOutDay[1] - 1, 
                            clockOutDay[2], clockOutTime[0], clockOutTime[1]);
                            
                        tdClockOut.setAttribute('data-id', id);
                        tdClockOut.innerText = convertTo12HourTime(time);
                    }
                }

                if(typeof clockIn !== 'undefined' && typeof clockOut !== 'undefined') {
                    var duration = (clockOut - clockIn)/60000,
                        durationMinutes = duration % 60,
                        durationHours = Math.floor(duration / 60);
    
                    tdDuration.innerText = `${
                            durationHours.toString().padStart(2, '0')
                        }:${
                            durationMinutes.toString().padStart(2, '0')
                        }`;
    
                    totalDuration += duration;
                }
            });
        }

        const footerRow = document.createElement('tr'),
            tableFooterHours = document.createElement('th'),
            tableFooterPay = document.createElement('th'),
            totalDurationMinutes = totalDuration % 60,
            totalDurationHours = Math.floor(totalDuration / 60);

        tableFooterPay.setAttribute('colspan', 2);
        tableFooterPay.innerText = convertHoursToPay(totalDuration / 60);

        tableFooterHours.setAttribute('colspan', 2);
        tableFooterHours.innerText = `${
            totalDurationHours.toString().padStart(2, '0')
        }:${
            totalDurationMinutes.toString().padStart(2, '0')
        }`;

        footerRow.append(tableFooterHours, tableFooterPay);
        weekTable.append(footerRow);

    }
}

function showTimesheet() {

    mainTab.classList.remove('selected');
    timesheetTab.classList.add('selected');

    db.collection("timecard").orderBy("date").orderBy("time").get().then(querySnapshot => {
        let events = querySnapshot.docs.map(entry => {
            return {id: entry.id, ...entry.data()};
        });
        timesheet = new Timesheet(events);
        timecard.innerHTML = "<div class=\"section-title\">Timecard</div>";
        buildTables();
        document.body.classList.add('display-table');
    });
}

function hideTimesheet() {

    timesheetTab.classList.remove('selected');
    mainTab.classList.add('selected');

    timecard.innerHTML = "<div class=\"section-title\">Timecard</div>";
    document.body.classList.remove('display-table');
}

const formURL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdJGyMq--4-WRQ7vuVM9soMf86vXiB2O8LK4m_oa38-_weefA/formResponse',
    date = document.querySelector('input[type=date]'),
    time = document.querySelector('input[type=time]'),
    timecard = document.querySelector('body .table'),
    mainTab = document.querySelector('#mainTab'),
    timesheetTab = document.querySelector('#timesheetTab'),
    now = new Date(),
    wage = 15;

var timesheet;

date.value = convertToDateString(now, true);

time.value = convertDateTo24HourTime(now);

document.querySelector('#submit').addEventListener('click', function() {
    const event = [...document.querySelectorAll('input[name=event]')]
        .find(radio => radio.checked);

    if(event == null) {
        alert('You must select either<br /><b>Check-In</b> or <b>Check-Out</b>.');
        return;
    }

    submitForm(event.value, date.value, time.value);
});
