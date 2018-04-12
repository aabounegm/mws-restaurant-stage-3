let restaurant;
var map;

/* global google, DBHelper, Blazy */
/* exported restaurant, map */
/**
 * Initialize Google map, called from HTML.
 */
let bLazy;
document.addEventListener('DOMContentLoaded', function(event) {
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
});
window.initMap = () => {
	fetchRestaurantFromURL((error, restaurant) => {
		if (error) { // Got an error!
			console.error(error);
		} else {
			self.map = new google.maps.Map(document.getElementById('map'), {
				zoom: 16,
				center: restaurant.latlng,
				scrollwheel: false
			});
			fillBreadcrumb();
			DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
			bLazy.revalidate();
		}
	});
};

/**
 * Get current restaurant from page URL.
 */
function fetchRestaurantFromURL(callback) {
	if (self.restaurant) { // restaurant already fetched!
		callback(null, self.restaurant);
		return;
	}
	const id = getParameterByName('id');
	if (!id) { // no id found in URL
		let error = 'No restaurant id in URL';
		callback(error, null);
	} else {
		DBHelper.fetchRestaurantById(id, (error, restaurant) => {
			self.restaurant = restaurant;
			if (!restaurant) {
				console.error(error);
				return;
			}
			fillRestaurantHTML();
			callback(null, restaurant);
		});
	}
}

/**
 * Create restaurant HTML and add it to the webpage
 */
function fillRestaurantHTML(restaurant = self.restaurant) {
	const name = document.getElementById('restaurant-name');
	name.innerHTML = restaurant.name;

	const address = document.getElementById('restaurant-address');
	address.innerHTML = restaurant.address;

	const image = document.getElementById('restaurant-img');
	const URLs = DBHelper.imageUrlForRestaurant(restaurant);
	image.className = 'restaurant-img';
	// image.src = URLs[2].slice(0, URLs[2].indexOf(' '));
	// image.srcset = URLs.map(url => `${url}`).join(', ');
	image.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';
	image.setAttribute('data-src', URLs[2]);	// Fallback
	image.setAttribute('data-src-200', URLs[0]);
	image.setAttribute('data-src-400', URLs[1]);
	image.setAttribute('data-src-600', URLs[2]);
	image.setAttribute('data-src-800', URLs[3]);
	image.sizes = '(max-width:800px) 100vw, 800px';
	image.alt = restaurant.name + ' restaurant picture';

	const cuisine = document.getElementById('restaurant-cuisine');
	cuisine.innerHTML = restaurant.cuisine_type;

	// fill operating hours
	if (restaurant.operating_hours) {
		fillRestaurantHoursHTML();
	}
	// fill reviews

	DBHelper.fetchReviewsByRestaurantId(restaurant.id, fillReviewsHTML);
	// fillReviewsHTML();
	bLazy.revalidate();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
function fillRestaurantHoursHTML(operatingHours = self.restaurant.operating_hours) {
	const hours = document.getElementById('restaurant-hours');
	for (let key in operatingHours) {
		const row = document.createElement('tr');

		const day = document.createElement('td');
		day.innerHTML = key;
		row.appendChild(day);

		const time = document.createElement('td');
		time.innerHTML = operatingHours[key];
		row.appendChild(time);

		hours.appendChild(row);
	}
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
function fillReviewsHTML(reviews = self.restaurant.reviews) {
	const container = document.getElementById('reviews-container');
	const title = document.createElement('h3');
	title.innerHTML = 'Reviews';
	container.appendChild(title);

	if (!reviews) {
		const noReviews = document.createElement('p');
		noReviews.innerHTML = 'No reviews yet (or no internet)!';
		container.appendChild(noReviews);
		return;
	}
	const ul = document.getElementById('reviews-list');
	reviews.forEach(review => {
		ul.appendChild(createReviewHTML(review));
	});
	container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
function createReviewHTML(review) {
	const li = document.createElement('li');
	li.className = 'review';

	const name = document.createElement('p');
	name.innerHTML = review.name;
	name.className = 'name';
	li.appendChild(name);

	const date = document.createElement('p');
	date.innerHTML = new Date(review.createdAt).toLocaleDateString();
	date.className = 'date';
	li.appendChild(date);

	const rating = document.createElement('p');
	rating.innerHTML = `Rating: ${review.rating}`;
	rating.className = 'rating';
	li.appendChild(rating);

	const comments = document.createElement('p');
	comments.innerHTML = review.comments;
	li.appendChild(comments);

	return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
function fillBreadcrumb(restaurant=self.restaurant) {
	const breadcrumb = document.getElementById('breadcrumb');
	const li = document.createElement('li');
	li.innerHTML = restaurant.name;
	li['aria-current'] = 'page';
	breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
function getParameterByName(name, url) {
	if (!url)
		url = window.location.href;
	name = name.replace(/[[\]]/g, '\\$&');
	const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
		results = regex.exec(url);
	if (!results)
		return null;
	if (!results[2])
		return '';
	return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

/**
 * Register the serive worker to make the app work offline
 */
if('serviceWorker' in navigator) {
	navigator.serviceWorker.register('../sw.js').then(function(registration) {
		console.log('Service Worker registered successfully!', registration);
		registration.sync.register('reviewOutbox')
			.then(() => console.log('SW sync registered ["reviewOutbox"]'))
			.catch(e => console.log('Can\'t register SW sync event:', e));
	}).catch(function(error) {
		console.error('Can\'t register Service Worker:', error);
	});
}

document.querySelector('input[type=date]').valueAsDate = new Date();
document.getElementById('add-review').onsubmit = function(e) {
	const data = {
		restaurant_id: parseInt(getParameterByName('id'), 10),
		name: this.name.value,
		// date: this.date,
		rating: parseInt(this.rating.value, 10),
		comments: this.comments.value
	};
	fetch('//localhost:1337/reviews/', {
		method: 'POST',
		body: JSON.stringify(data)
	}).then(function(res) {
		console.log('Review added successfully!');
		window.location.reload(true);						// Refresh to see it
	}).catch(function(error) {
		console.log('Internet problem! Queuing review until sync');
		// TODO: actually add to IDB and check in SW
		DBHelper.addToOutbox(data);
	});
	this.reset();
};