let restaurants,
	neighborhoods,
	cuisines;
var map;
var markers = [];

/* global DBHelper, google, Blazy */
/* exported restaurants, neighborhoods, cuisines, map, markers */

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
let bLazy;
document.addEventListener('DOMContentLoaded', (event) => {
	bLazy = new Blazy({
		breakpoints: [
			{
				width: 200,
				src: 'data-src-200'
			},
			{
				width: 400,
				src: 'data-src-400'
			},
			{
				width: 600,
				src: 'data-src-600'
			},
			{
				width: 800,
				src: 'data-src-800'
			},
		],
		selector: '.restaurant-img',
		success: function(element) {
			// console.log(element);
		},
		error: function(ele, msg){
			// console.log(ele, msg);
			if(msg === 'missing'){
				// Data-src is missing
			}
			else if(msg === 'invalid'){
				// Data-src is invalid
			}  
		}
	});	
	fetchNeighborhoods();
	fetchCuisines();
	bLazy.revalidate();
});

/**
 * Fetch all neighborhoods and set their HTML.
 */
function fetchNeighborhoods () {
	DBHelper.fetchNeighborhoods((error, neighborhoods) => {
		if (error) { // Got an error
			console.error(error);
		} else {
			self.neighborhoods = neighborhoods;
			fillNeighborhoodsHTML();
		}
	});
}

/**
 * Set neighborhoods HTML.
 */
function fillNeighborhoodsHTML(neighborhoods = self.neighborhoods) {
	const select = document.getElementById('neighborhoods-select');
	neighborhoods.forEach(neighborhood => {
		const option = document.createElement('option');
		option.innerHTML = neighborhood;
		option.value = neighborhood;
		select.append(option);
	});
}

/**
 * Fetch all cuisines and set their HTML.
 */
function fetchCuisines() {
	DBHelper.fetchCuisines((error, cuisines) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.cuisines = cuisines;
			fillCuisinesHTML();
		}
	});
}

/**
 * Set cuisines HTML.
 */
function fillCuisinesHTML(cuisines = self.cuisines) {
	const select = document.getElementById('cuisines-select');

	cuisines.forEach(cuisine => {
		const option = document.createElement('option');
		option.innerHTML = cuisine;
		option.value = cuisine;
		select.append(option);
	});
}

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
	let loc = {
		lat: 40.722216,
		lng: -73.987501
	};
	self.map = new google.maps.Map(document.getElementById('map'), {
		zoom: 12,
		center: loc,
		scrollwheel: false
	});
	updateRestaurants();
};

/**
 * Update page and map for current restaurants.
 */
function updateRestaurants () {
	const cSelect = document.getElementById('cuisines-select');
	const nSelect = document.getElementById('neighborhoods-select');

	const cIndex = cSelect.selectedIndex;
	const nIndex = nSelect.selectedIndex;

	const cuisine = cSelect[cIndex].value;
	const neighborhood = nSelect[nIndex].value;

	DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			resetRestaurants(restaurants);
			fillRestaurantsHTML();
		}
	});
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
function resetRestaurants(restaurants) {
	// Remove all restaurants
	self.restaurants = [];
	const ul = document.getElementById('restaurants-list');
	ul.innerHTML = '';

	// Remove all map markers
	self.markers.forEach(m => m.setMap(null));
	self.markers = [];
	self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
function fillRestaurantsHTML(restaurants = self.restaurants) {
	const ul = document.getElementById('restaurants-list');
	restaurants.forEach(restaurant => {
		ul.append(createRestaurantHTML(restaurant));
	});
	bLazy.revalidate();
	addMarkersToMap();
}

/**
 * Create restaurant HTML.
 */
function createRestaurantHTML(restaurant) {
	const li = document.createElement('li');
	const URLs = DBHelper.imageUrlForRestaurant(restaurant);
	const image = document.createElement('img');
	const favorite = document.createElement('i');
	
	image.className = 'restaurant-img';
	// image.src = URLs[1].slice(0, URLs[1].indexOf(' '));
	image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	image.setAttribute('data-src', URLs[1]);	// Fallback
	image.setAttribute('data-src-200', URLs[0]);
	image.setAttribute('data-src-400', URLs[1]);
	image.setAttribute('data-src-600', URLs[2]);
	image.setAttribute('data-src-800', URLs[3]);
	image.alt = restaurant.name + ' restaurant picture';
	// image.srcset = URLs.join(', ');
	// image.sizes = '(max-width:800px) 100vw, 800px';
	li.append(image);

	const name = document.createElement('h2');
	name.innerHTML = restaurant.name;
	li.append(name);

	const neighborhood = document.createElement('p');
	neighborhood.innerHTML = restaurant.neighborhood;
	li.append(neighborhood);

	const address = document.createElement('p');
	address.innerHTML = restaurant.address;
	li.append(address);

	const more = document.createElement('a');
	more.innerHTML = 'View Details';
	more.href = DBHelper.urlForRestaurant(restaurant);
	li.append(more);

	favorite.className = 'checkbox';
	favorite.onclick = function(e) {
		let checking = this.classList.toggle('toggled');
		DBHelper.toggleFavorite(restaurant.id, checking);
	};
	if(restaurant.is_favorite)
		favorite.classList.add('toggled');
	li.append(favorite);

	return li;
}

/**
 * Add markers for current restaurants to the map.
 */
function addMarkersToMap(restaurants = self.restaurants) {
	restaurants.forEach(restaurant => {
		// Add marker to the map
		const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
		google.maps.event.addListener(marker, 'click', () => {
			window.location.href = marker.url;
		});
		self.markers.push(marker);
	});
}

/**
 * Register the serive worker to make the app work offline
 */
if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('../sw.js').then(function(registration) {
		console.log('Service Worker registered successfully!', registration);
	}).catch(function(error) {
		console.error('Can\'t register Service Worker:', error);
	});
}