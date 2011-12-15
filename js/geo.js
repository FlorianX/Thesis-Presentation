// checks if the geolocation api is available
if (typeof navigator.geolocation !== 'undefined') {
	// initialize some variable
	var map;
	var infowindow = new google.maps.InfoWindow();
	var geocoder;
	/*
	 * - initialize the google maps api with jQuery dom.ready - initailize the
	 * map with the FHS building as default location
	 */
	$(document).ready(
			function() {
				// initialize the gecoder to get later the address of the useres
				// location
				geocoder = new google.maps.Geocoder();

				// the default/ starting point of the map
				var latlng = new google.maps.LatLng(50.715313, 10.467457);

				// some special options for the map
				var myOptions = {
					zoom : 18,
					center : latlng,
					mapTypeId : google.maps.MapTypeId.SATELLITE
				};

				// creating the map
				map = new google.maps.Map(
						document.getElementById("map_canvas"), myOptions);
			});

	/*
	 * will be called when somebody clicks on the button
	 * 
	 */
	function findMe() {
		// defining the success callback function
		var successCallback = function(position) {
			// get the latitude and longitude from the geolocation api
			var myLatitude = position.coords.latitude;
			var myLongitude = position.coords.longitude;

			/*
			 * creating a new point with the location data of the user and set
			 * it to the map
			 */
			var newPoint = new google.maps.LatLng(myLatitude, myLongitude)
			map.setCenter(newPoint, 15);

			// Needed to add the address in an infoWindow
			if (geocoder) {
				geocoder
						.geocode(
								{
									'latLng' : newPoint
								},
								function(results, status) {
									if (status == google.maps.GeocoderStatus.OK) {
										if (results[1]) {
											map.setZoom(15);
											// creating a marker for the
											// location
											marker = new google.maps.Marker({
												position : newPoint,
												map : map
											});

											// insert the address data
											infowindow
													.setContent(results[0].formatted_address);
											infowindow.open(map, marker);
										}
									} else {
										alert("Geocoder failed due to: "
												+ status);
									}
								});
			}

			// show all informations that have been collected by the browser
			console.log(position);

			var msg = '<pre><em>Timestamp</em>: ' + position.timestamp + '<br>'
					+ '<em>latitude</em>: ' + position.coords.latitude + '<br>'
					+ '<em>longitude</em>: ' + position.coords.longitude + '<br>'
					+ '<em>altitude</em>: ' + position.coords.altitude + '<br>'
					+ '<em>accuracy</em>: ' + position.coords.accuracy + '<br>'
					+ '<em>altitude accuracy</em>: ' + position.coords.altitudeAccuracy
					+ '<br>' + '<em>heading</em>: ' + position.coords.heading + '<br>'
					+ '<em>speed</em>: ' + position.coords.speed + '</pre>';

			$('#msg').html(msg);
		};
		// defining the error callback
		var errorCallback = function(error) {
			switch (error.code) {
			case error.TIMEOUT:
				alert('Location Service doesn\'t answer, timeout!');
				break;
			case error.POSITION_UNAVAILABLE:
				alert('Position unavailable');
				break;
			case error.PERMISSION_DENIED:
				alert('Permission denied');
				break;
			default:
				alert('Somethings wrong, sorry.');
				break;
			}
		};
		// defining some options for the geo api
		var options = {
			enableHighAccuracy : true, // super accuracy
			timeout : 2000, // maximum waiting time
			maximumAge : 0
		// maximum acceptable cache age
		};

		// call the geolocation api
		navigator.geolocation.getCurrentPosition(successCallback,
				errorCallback, options);
		/*
		 * How does firefox (or an other browser) knows where you are? Its
		 * called "Google Location Services". More information here:
		 * http://www.mozilla.com/en/firefox/geolocation/
		 */

	}
} else {
	// is shown if the browser doesn't support the geolocation api
	$('#map_canvas')
			.html(
					'<h3>Sorry, but your browser does not support the Geolocation API of HTML5!</h3>');
}