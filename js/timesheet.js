class Timesheet {

    payMap;
    hourlyRate;
    table;
    currentRow;

    constructor(hourlyRate) {

        this.payMap = {};
        this.table = document.createElement('table');
        this.hourlyRate = hourlyRate;

        this.appendRow(true);

        this.currentRow.date.innerText = 'Date';
        this.currentRow.clockIn.innerText = 'Clock-In';
        this.currentRow.clockOut.innerText = 'Clock-Out';
        this.currentRow.duration.innerText = 'Duration';
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

    convertHoursToWageString(duration) {
        return `$${((duration / 60) * this.hourlyRate).toFixed(2)}`;
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
            duration = document.createElement(cellType);

        tr.append(date, clockIn, clockOut, duration);
        this.table.appendChild(tr);

        this.currentRow = {date, clockIn, clockOut, duration};
    }

    clockIn(id = '', date = '', time = '') {
        this.appendRow();

        this.currentRow.clockIn.setAttribute('data-id', id);
        this.currentRow.clockIn.setAttribute('data-date', date);
        this.currentRow.clockIn.setAttribute('data-time', time);
        this.currentRow.date.innerText = this.convertDate(date);

        this.currentRow.clockIn.innerText = this.convertTo12HourTime(time);
    }

    clockOut(id = '', date = '', time = '') {

        if(this.currentRow.date.innerText == '') {
            this.currentRow.date.innerText = this.convertDate(date);
        }

        this.currentRow.clockOut.setAttribute('data-id', id);
        this.currentRow.clockOut.setAttribute('data-date', date);
        this.currentRow.clockOut.setAttribute('data-time', time);
        this.currentRow.clockOut.innerText = this.convertTo12HourTime(time);
        
        if(this.currentRow.clockIn.innerText == '' || this.currentRow.clockOut.innerText == '') return;

        var clockInDate = this.currentRow.clockIn.getAttribute('data-date').split('-').map(x => parseInt(x)),
            clockOutDate = this.currentRow.clockOut.getAttribute('data-date').split('-').map(x => parseInt(x)),
            clockInTime = this.currentRow.clockIn.innerText.split(':').map(x => parseInt(x)),
            clockOutTime = this.currentRow.clockOut.innerText.split(':').map(x => parseInt(x));
        
        var clockIn = new Date(clockInDate[0], clockInDate[1] - 1, clockInDate[2], clockInTime[0], clockInTime[1]),
            clockOut = new Date(clockOutDate[0], clockOutDate[1] - 1, clockOutDate[2], clockOutTime[0], clockOutTime[1]);
        
        var duration = (clockOut - clockIn)/60000,
            durationMinutes = duration % 60,
            durationHours = Math.floor(duration / 60);

        this.currentRow.duration.innerText = `${
                durationHours.toString().padStart(2, '0')
            }:${
                durationMinutes.toString().padStart(2, '0')
            }`;

        // TODO: Add wages to seperate table
        const week = `${
                new Date(clockIn - (clockIn.getDay() * 86400000))
            } - ${
                new Date(clockIn - ((8 - clockIn.getDay()) * 86400000))
            }`;
        this.payMap[week] += duration;
        // this.currentRow.wages.innerText = convertHoursToWageString(duration);
    }

    export() {
        return this.table;
    }
}