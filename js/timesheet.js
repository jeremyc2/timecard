class Timesheet {

    hourlyRate;
    weeks;

    constructor(hourlyRate) {
        this.hourlyRate = hourlyRate;
        this.weeks = new Map();
    }

    #convertHoursToPay(duration) {
        return `$${((duration / 60) * this.hourlyRate).toFixed(2)}`;
    }

    // TODO Handle empty events
    #clockEvent(id, event, date, time) {
        const parsedDate = date.split('-').map(x => parseInt(x)),
            clockIn = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]),
            weekStart = new Date(clockIn.getTime() - (clockIn.getDay() * 86400000)),
            weekEnd = new Date(weekStart.getTime() + 518400000),
            week = `${convertToDateString(weekStart)} - ${convertToDateString(weekEnd)}`,
            day = convertToDateString(clockIn);

        if(this.weeks.has(week)) {
            var days = this.weeks.get(week);

            if(days.has(day)) {
                days.get(day).push({id, event, time});
            } else {
                days.set(day, [{id, event, time}]);
            }
        } else {
            var days = new Map();
            days.set(day, [{id, event, time}]);
            this.weeks.set(week, days);
        }
    }

    clockIn(id = '', date = '', time = '') {
        this.#clockEvent(id, 'Clock-In', date, time);
    }

    clockOut(id = '', date = '', time = '') {
        this.#clockEvent(id, 'Clock-Out', date, time);
    }

}