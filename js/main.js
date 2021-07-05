// TODO Make async and return proceed
async function confirm(message) {
    const modalContent = document.querySelector('#modal-1-content');

    modalContent.innerHTML = message;

    MicroModal.show('modal-1');
}

async function submitForm(event, date, time) {
    if(event == "" || event == null) return;
    if(date == "" || date == null) return;
    if(time == "" || time == null) return;
    
    var proceed = await confirm(`${
            event == 'Clock-In'? 'Clock in': 'Clock out'
        } ${
            convertTo12HourTime(time, false)
        }<br />${
            expandDatestring(date)
        }?`);

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
    for (let [week, days] of [...timesheet.weeks].reverse()) {
        const weekTable = document.createElement('table'),
            titleRow = document.createElement('tr'),
            tableTitle = document.createElement('th'),
            headerRow = document.createElement('tr'),
            headerDay = document.createElement('th'),
            headerClockIn = document.createElement('th'),
            headerClockOut = document.createElement('th'),
            headerDuration = document.createElement('th');

        var totalDuration = 0;

        tableTitle.setAttribute('colspan', 4);
        tableTitle.innerText = week;

        headerDay.innerText = 'Date';
        headerClockIn.innerText = 'Clock-In';
        headerClockOut.innerText = 'Clock-Out';
        headerDuration.innerText = 'Duration';

        titleRow.append(tableTitle);
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
            tableFooter = document.createElement('th');

        tableFooter.setAttribute('colspan', 4);
        tableFooter.innerText = convertHoursToPay(totalDuration / 60);

        footerRow.append(tableFooter);
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
        timecard.innerHTML = '';
        buildTables();
        document.body.classList.add('display-table');
    });
}

function hideTimesheet() {

    timesheetTab.classList.remove('selected');
    mainTab.classList.add('selected');

    timecard.innerHTML = '';
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

    if(event == null) return;

    submitForm(event.value, date.value, time.value);
});
