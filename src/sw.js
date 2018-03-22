const cacheName = "restaurant-reviews-ver1.0";

const cssFiles = ['styles'];
const dataFiles = ['restaurants'];
const imgFiles = [1,2,3,4,5,6,7,8,9,10];
const jsFiles = ['dbhelper', 'main', 'restaurant_info']
const htmlFiles = ['index', 'restaurant'];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				...htmlFiles.map( fileName => `/${fileName}.html`),
				...cssFiles.map( fileName => `/css/${fileName}.css`),
				...dataFiles.map( fileName => `/data/${fileName}.json`),
				...imgFiles.map( fileName => `/img/${fileName}.jpg`),
				...jsFiles.map( fileName => `/js/${fileName}.js`)
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.open(cacheName).then(function(cache) {
			return cache.match(event.request).then(function(response) {
				return response || fetch(event.request).then(function(response) {
					cache.put(event.request, response.clone());
					return response;
				}).catch(function(error) {
					console.log(error);
					return new Response("No internet!");
				});
			});
		})
	);
});

self.addEventListener('activate', function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.filter(name => name != cacheName).map(cache => caches.delete(cache)));
		})
	);
});