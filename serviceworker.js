const path = (new URL(self.registration.scope)).pathname;

const version = "16.4",
      cacheName = `Timecard-V${version}`;

// TODO The cache breaks firebaseui
// const cachefiles = [
//     path,
//     path + "css/admin.css",
//     path + "css/firebaseui.css",
//     path + "css/main.css",
//     path + "css/modal.css",
//     path + "css/table.css",
//     path + "images/icons/192.png",
//     path + "images/icons/512.png",
//     path + "images/qrcode.png",
//     path + "images/background.svg",
//     path + "images/menu_white_24dp.svg",
//     path + "images/unfold_less_white_24dp.svg",
//     path + "images/unfold_more_white_24dp.svg",
//     path + "js/admin.js",
//     path + "js/dateUtils.js",
//     path + "js/firebase.js",
//     path + "js/firebaseui.js",
//     path + "js/main.js",
//     path + "js/menu.js",
//     path + "js/micromodal.min.js",
//     path + "js/timecard.js",
//     path + "index.html",
//     path + "qrcode.html",
// ];

const broadcastChannel = new BroadcastChannel('channel1');

self.addEventListener("install", () => {
    self.skipWaiting();
});
 
self.addEventListener("activate", () => {
    clients.claim();
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
            shortcuts: [],
            start_url: path,
            scope: path,
            background_color: "#aa3333",
            theme_color: "hsl(357deg, 21%, 17%)",
            display: "standalone"
        };

        broadcastChannel.postMessage({type: 'getRecents'});
        event.respondWith(
            new Promise((resolve) => {
                broadcastChannel.onmessage = event => {
                    if(event.data.type == 'recents') {
                        manifest.shortcuts = event.data.body.map(user => {
                            return {
                                name: user.displayName,
                                url: `?page=Timecard&activeUid=${
                                    user.id
                                }&activeDisplayName=${
                                    encodeURIComponent(user.displayName)
                                }`
                            };
                        });
                        resolve(new Response(JSON.stringify(manifest), {
                            headers: {'Content-Type': 'text/html'}
                        }));
                    }
                }
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