class Timesheet {

    payMap;
    hourlyRate;
    eventTable;
    payTable;
    currentEventRow;

    constructor(hourlyRate) {

        this.payMap = {};
        this.eventTable = document.createElement('table');
        this.payTable = document.createElement('table');
        this.hourlyRate = hourlyRate;
        this.currentEventRow = {date: null, clockIn: null, clockOut: null, duration: null};
        this.currentPayRow = {week: null, pay: null};

        this.appendRow(true, this.eventTable, this.currentEventRow);

        this.currentEventRow.date.innerText = 'Date';
        this.currentEventRow.clockIn.innerText = 'Clock-In';
        this.currentEventRow.clockOut.innerText = 'Clock-Out';
        this.currentEventRow.duration.innerText = 'Duration';

        this.appendRow(true, this.payTable, this.currentPayRow);

        this.currentPayRow.week.innerText = 'Week';
        this.currentPayRow.pay.innerText = 'Pay';
    }

    convertDate(date) {
        if(date == null || date == '') return date;

        var dateArray = date.split('-').map(x => parseInt(x));

        date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);

        return date.toDateString().substring(0, 10);
    }

    convertTo12HourTime(time) {

        if(time == null || time == '') return time;

        var timeArray = time.split(':').map(t => parseInt(t)),
            meridiem = 'AM';

        if(timeArray[0] > 12) {
            timeArray[0] -= 12;
            meridiem = 'PM';
        }

        return `${
                timeArray[0].toString().padStart(2, '0')
            }:${
                timeArray[1].toString().padStart(2, '0')
            } ${
                meridiem
            }`;
    }

    convertHoursToPay(duration) {
        return `$${((duration / 60) * this.hourlyRate).toFixed(2)}`;
    }

    appendRow(isHeader, table, currentRow) {
        const tr = document.createElement('tr');

        var cellType;
        if(isHeader) {
            cellType = 'th';
        } else {
            cellType = 'td'
        }

        Object.keys(currentRow).forEach(col => {
            var cell = document.createElement(cellType);
            tr.append(cell);
            currentRow[col] = cell;
        });

        table.appendChild(tr);
    }

    clockIn(id = '', date = '', time = '') {
        this.appendRow(false, this.eventTable, this.currentEventRow);

        this.currentEventRow.clockIn.setAttribute('data-id', id);
        this.currentEventRow.clockIn.setAttribute('data-date', date);
        this.currentEventRow.clockIn.setAttribute('data-time', time);
        this.currentEventRow.date.innerText = this.convertDate(date);

        this.currentEventRow.clockIn.innerText = this.convertTo12HourTime(time);
    }

    clockOut(id = '', date = '', time = '') {

        if(this.currentEventRow.date.innerText == '') {
            this.currentEventRow.date.innerText = this.convertDate(date);
        }

        this.currentEventRow.clockOut.setAttribute('data-id', id);
        this.currentEventRow.clockOut.setAttribute('data-date', date);
        this.currentEventRow.clockOut.setAttribute('data-time', time);
        this.currentEventRow.clockOut.innerText = this.convertTo12HourTime(time);
        
        if(this.currentEventRow.clockIn.innerText == '' || this.currentEventRow.clockOut.innerText == '') return;

        var clockInDate = this.currentEventRow.clockIn.getAttribute('data-date').split('-').map(x => parseInt(x)),
            clockOutDate = this.currentEventRow.clockOut.getAttribute('data-date').split('-').map(x => parseInt(x)),
            clockInTime = this.currentEventRow.clockIn.innerText.split(':').map(x => parseInt(x)),
            clockOutTime = this.currentEventRow.clockOut.innerText.split(':').map(x => parseInt(x));
        
        var clockIn = new Date(clockInDate[0], clockInDate[1] - 1, clockInDate[2], clockInTime[0], clockInTime[1]),
            clockOut = new Date(clockOutDate[0], clockOutDate[1] - 1, clockOutDate[2], clockOutTime[0], clockOutTime[1]);
        
        var duration = (clockOut - clockIn)/60000,
            durationMinutes = duration % 60,
            durationHours = Math.floor(duration / 60);

        this.currentEventRow.duration.innerText = `${
                durationHours.toString().padStart(2, '0')
            }:${
                durationMinutes.toString().padStart(2, '0')
            }`;

        // TODO: Add wages to seperate table
        const weekStart = new Date(clockIn.getTime() - (clockIn.getDay() * 86400000)),
              weekEnd = new Date(weekStart.getTime() + (518400000));

        const week = `${convertToDateString(weekStart)} - ${convertToDateString(weekEnd)}`;

        if(typeof this.payMap[week] === 'undefined') {
            this.payMap[week] = duration;
        } else {
            this.payMap[week] += duration;
        }
    }

    getEventTable() {
        return this.eventTable;
    }

    getPayTable() {
        Object.entries(this.payMap).forEach(week => {
            this.appendRow(false, this.payTable, this.currentPayRow);
            this.currentPayRow.week.innerText = week[0];
            this.currentPayRow.pay.innerText = this.convertHoursToPay(week[1]);
        });

        return this.payTable;
    }
}