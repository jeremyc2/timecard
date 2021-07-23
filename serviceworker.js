const path = (new URL(self.registration.scope)).pathname;

const version = "7.8",
      cacheName = `Timecard-V${version}`;

const cachefiles = [
    path,
    path + "images/icons/192.png",
    path + "images/icons/512.png",
    path + "images/qrcode.png",
    path + "images/unfold_less_white_24dp.svg",
    path + "images/unfold_more_white_24dp.svg",
    path + "js/dateUtils.js",
    path + "js/firebase.js",
    path + "js/googleSheet.js",
    path + "js/main.js",
    path + "js/micromodal.min.js",
    path + "js/swipe.js",
    path + "js/timesheet.js",
    path + "index.html",
    path + "qrcode.html",
    path + "manifest.webmanifest"
]

self.addEventListener("install", event => {
    self.skipWaiting();
    
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(cachefiles);
        })
    );

});
 
self.addEventListener("activate", event => {
    clients.claim();
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(name) {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                    return name != cacheName;
                }).map(function(name) {
                    return caches.delete(name);
                })
            );
        })
    );

});

self.addEventListener("fetch", event => {
    const parsedUrl = new URL(event.request.url);

    // might have to clone request and response

    if(parsedUrl.host == self.location.host) {
        event.respondWith(
            caches.match(event.request).then(function(response) {
                return response || fetch(event.request);
            })
        );
    } else {
        return fetch(event.request);
    }

});