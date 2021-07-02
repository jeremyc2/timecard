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

function expandDatestring(date) {
    if(date == null || date == '') return date;

    var dateArray = date.split('-').map(x => parseInt(x));

    date = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);

    return date.toDateString().substring(0, 15);
}