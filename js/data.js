var clockedIn = false;

// Foreach
if(clockedIn) {
    if(x.event == "Clock-In") {
        // Input empty clock-out
        // New row
        // Input clock-in
        clockedIn = true;
    } else if(x.event == "Clock-Out") {
        // Input clock-out
        clockedIn = false;
    }
} else {
    // New row
    if(x.event == "Clock-In") {
        // Input clock-in
        clockedIn = true;
    } else if(x.event == "Clock-Out") {
        // Input empty clock-in
        // Input clock-out
        clockedIn = false;
    }
}
