function convertDateTo24HourTime(date) {
    return `${
        date.getHours().toString().padStart(2, 0)
    }:${
        date.getMinutes().toString().padStart(2, 0)
    }`;
}

function convertTo12HourTime(time) {

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

function convertToDateString(date, isSortable) {
    if(isSortable) {
        return `${
            date.getFullYear()
        }-${
            (date.getMonth() + 1).toString().padStart(2, 0)
        }-${
            date.getDate().toString().padStart(2, 0)
        }`;
    } else {
        return `${
            (date.getMonth() + 1).toString().padStart(2, 0)
        }/${
            date.getDate().toString().padStart(2, 0)
        }/${
            date.getYear().toString().substring(1)
        }`;
    }
}

function nth(d) {
    if (d > 3 && d < 21) return `${d}<sup>th</sup>`;
    switch (d % 10) {
        case 1:  return `${d}<sup>st</sup>`;
        case 2:  return `${d}<sup>nd</sup>`;
        case 3:  return `${d}<sup>rd</sup>`;
        default: return `${d}<sup>th</sup>`;
    }
}

function getFullDayOfWeek(day) {
    switch (day) {
        case 0:
            return 'Sunday';
        case 1:
            return 'Monday';
        case 2:
            return 'Tuesday';
        case 3:
            return 'Wednesday';
        case 4:
            return 'Thursday';
        case 5:
            return 'Friday';
        case 6:
            return 'Saturday';
    }
}

function getMonthName(month) {
    switch (month) {
        case 0:
            return 'Jan';
        case 1:
            return 'Feb';
        case 2:
            return 'Mar';
        case 3:
            return 'Apr';
        case 4:
            return 'May';
        case 5:
            return 'June';
        case 6:
            return 'July';
        case 7:
            return 'Aug';
        case 8:
            return 'Sept';
        case 9:
            return 'Oct';
        case 10:
            return 'Nov';
        case 11:
            return 'Dec';
    }
}

function expandDatestring(date, isCompact) {
    if(date == null || date == '') return date;

    var dateArray = date.split('-').map(x => parseInt(x));

    date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);

    if(isCompact) {
        var dayOfWeek = getFullDayOfWeek(date.getDay()),
            month = getMonthName(date.getMonth()),
            dateString = nth(date.getDate());
        return `${dayOfWeek} ${month} ${dateString}`;
    }

    return date.toDateString().substring(0, 15);
}