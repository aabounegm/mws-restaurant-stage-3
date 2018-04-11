/* eslint-env worker */
/* global Dexie */
importScripts('https://cdnjs.cloudflare.com/ajax/libs/dexie/2.0.2/dexie.min.js');
const cacheName = 'restaurant-reviews-ver1.0';

const cssFiles = ['styles'];
const dataFiles = ['restaurants'];
const imgFiles = [1,2,3,4,5,6,7,8,9,10];
const jsFiles = ['dbhelper', 'main', 'restaurant_info'];
const htmlFiles = ['index', 'restaurant'];

self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open(cacheName).then(function(cache) {
			return cache.addAll([
				'',
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
					console.error(error);
					return new Response('No internet or server not available!');
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

self.addEventListener('sync', function(event) {
	console.log('Recieved sync event');
	if(event.tag !== 'reviewOutbox')
		return;
	event.waitUntil(new Promise(function(resolve, reject) {
		new Dexie('reviewOutbox').open().then(function(outBox) {
			const table = outBox.table('reviews');
			table.count().then(c => c && console.log(`Found ${c} queued review${c>1?'s':''}`));
			let toDelete = [], fetches = [];
			table.each(async function(review, cursor) {
				const key = cursor.primaryKey;
				let x = fetch('//localhost:1337/reviews/', {
					method: 'POST',
					body: JSON.stringify(review)
				}).then(function(res) {
					console.log('Successfully sent review', key);
					toDelete.push(key);
				}).catch(reject);
				fetches.push(x);
			}).then(function() {
				Promise.all(fetches).then(function(){
					return table.bulkDelete(toDelete);
				}).then( function() {
					console.log(`Removed ${toDelete.length} items from queue`); 
					resolve();
				}).catch( function(error) {
					console.error('Can\'t remove from queue!', error);
				});
			}).catch(function(error) {
				console.log('Can\'t open table!', error);
				reject();
			});
		}).catch(function(error) {
			console.log('Can\'t open IDB!', error);
			reject();
		});
	}));
});