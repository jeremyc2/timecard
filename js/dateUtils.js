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

function expandDatestring(date, isCompact) {
    if(date == null || date == '') return date;

    var dateArray = date.split('-').map(x => parseInt(x));

    date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);

    if(isCompact) {
        var dayOfWeek = getFullDayOfWeek(date.getDay()).padEnd(9, '~').replaceAll('~', '&nbsp;'),
            dateString = date.getDate().toString().padStart(2, '~').replaceAll('~', '&nbsp;');
        return `${dayOfWeek} ${dateString}`;
    }

    return date.toDateString().substring(0, 15);
}