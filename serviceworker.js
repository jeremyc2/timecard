const path = (new URL(self.registration.scope)).pathname;

const version = "16.4",
      cacheName = `Timecard-V${version}`;

const cachefiles = [
    path,
    path + "css/admin.css",
    path + "css/firebaseui.css",
    path + "css/main.css",
    path + "css/modal.css",
    path + "css/table.css",
    path + "images/icons/192.png",
    path + "images/icons/512.png",
    path + "images/qrcode.png",
    path + "images/background.svg",
    path + "images/menu_white_24dp.svg",
    path + "images/unfold_less_white_24dp.svg",
    path + "images/unfold_more_white_24dp.svg",
    path + "js/admin.js",
    path + "js/dateUtils.js",
    path + "js/firebase.js",
    path + "js/firebaseui.js",
    path + "js/main.js",
    path + "js/menu.js",
    path + "js/micromodal.min.js",
    path + "js/timecard.js",
    path + "index.html",
    path + "qrcode.html",
    "bugfix"
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

    if(event.request.url.endsWith("manifest.webmanifest")) {

        const manifest = {
            author: "Jeremy Chandler",
            short_name: "Timecard",
            name: "Timecard",
            description: "Clock-in and Clock-out, see your hours and wages",
            version: "0.1",
            orientation: "portrait",
            icons: [
              {
                src: path + "images/icons/192.png",
                type: "image/png",
                sizes: "192x192",
                purpose: "any maskable"
              },
              {
                src: path + "images/icons/512.png",
                type: "image/png",
                sizes: "512x512",
                purpose: "any maskable"
              }
            ],
            start_url: path,
            scope: path,
            background_color: "#aa3333",
            theme_color: "hsl(357deg, 21%, 17%)",
            display: "standalone"
        };

        event.respondWith(
            new Response(JSON.stringify(manifest), {
              headers: {'Content-Type': 'text/html'}
            })
        );

        return;
    }

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
