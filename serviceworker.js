const path = (new URL(self.registration.scope)).pathname;

const version = "4.0",
      cacheName = `Timecard-V${version}`;

// TODO Fill in the rest of the cache files
const cachefiles = [
    path,
    path + "index.html",
    path + "qrcode.html",
    path + "manifest.webmanifest"
]

const broadcast = new BroadcastChannel('retro-channel');
broadcast.onmessage = (event) => {
    if(event.data.type == 'REQUEST-VERSION') {
        broadcast.postMessage({type: 'APP-VERSION', payload: version});
    }
}

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
        return;
    }

});