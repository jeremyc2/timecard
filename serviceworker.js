const version = "16.7",
    broadcastChannel = new BroadcastChannel('channel1'),
    path = (new URL(self.registration.scope)).pathname;

self.addEventListener("install", () => {
    self.skipWaiting();
});
 
self.addEventListener("activate", () => {
    clients.claim();
});

self.addEventListener("fetch", event => {
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
                                url: path + `?page=Timecard&activeUid=${
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
    }
});
