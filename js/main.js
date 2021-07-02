function submitForm(event, date, time) {
    if(event == "" || event == null) return;
    if(date == "" || date == null) return;
    if(time == "" || time == null) return;
    
    if(JSON.stringify(lastEventThisSession) === JSON.stringify({date, time})) {
        var proceed = confirm(`Are you sure you want to ${
                                    event
                                  } on ${
                                    expandDatestring(date)
                                  } at ${
                                    convertTo12HourTime(time)
                                  }?`);
        if(!proceed) return;
    };

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
        lastEventThisSession = {date, time};
        alert('Timecard Updated');
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

function showTimesheet() {

    mainTab.classList.remove('selected');
    timesheetTab.classList.add('selected');

    var clockedIn = false;
    db.collection("timecard").orderBy("date").orderBy("time").get().then(querySnapshot => {
        timesheet = new Timesheet(wage);
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
        document.body.classList.add('display-table');
    });
}

function hideTimesheet() {

    timesheetTab.classList.remove('selected');
    mainTab.classList.add('selected');

    table.innerHTML = '';
    document.body.classList.remove('display-table');
}

const formURL = 'https://docs.google.com/forms/u/0/d/e/1FAIpQLSdJGyMq--4-WRQ7vuVM9soMf86vXiB2O8LK4m_oa38-_weefA/formResponse',
    date = document.querySelector('input[type=date]'),
    time = document.querySelector('input[type=time]'),
    table = document.querySelector('body .table'),
    mainTab = document.querySelector('#mainTab'),
    timesheetTab = document.querySelector('#timesheetTab'),
    now = new Date(),
    wage = 15;

var timesheet = new Timesheet(wage),
    lastEventThisSession;

date.value = convertToDateString(now, true);

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
