class Timecard {

    weeks;

    constructor(events) {
        this.weeks = new Map();

        if(events == null) return;

        var clockedIn = false;

        events.forEach(({id, event, date, time}, index) => {
            if(clockedIn) {
                if(event == "Clock-In") {
                    // Input empty clock-out
                    var lastEvent = events[index - 1];
                    this.clockOut(null, lastEvent.date, null);
                    // Input clock-in
                    this.clockIn(id, date, time);
                    clockedIn = true;
                } else if(event == "Clock-Out") {
                    // Input clock-out
                    this.clockOut(id, date, time);
                    clockedIn = false;
                }
            } else {
                if(event == "Clock-In") {
                    // Input clock-in
                    this.clockIn(id, date, time);
                    clockedIn = true;
                } else if(event == "Clock-Out") {
                    // Input empty clock-in
                    this.clockIn(null, date, null);
                    // Input clock-out
                    this.clockOut(id, date, time);
                    clockedIn = false;
                }
            }
        });
    }

    #clockEvent(id, event, date, time) {
        const parsedDate = date.split('-').map(x => parseInt(x)),
            clockIn = new Date(parsedDate[0], parsedDate[1] - 1, parsedDate[2]),
            weekStart = new Date(clockIn.getTime() - (clockIn.getDay() * 86400000)),
            weekEnd = new Date(weekStart.getTime() + 518400000),
            week = `${convertToDateString(weekStart)} - ${convertToDateString(weekEnd)}`,
            day = convertToDateString(clockIn, true);

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