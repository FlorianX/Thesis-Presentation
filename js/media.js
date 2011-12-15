/**
 * function to transform the seconds in a nicer form
 */
function transSec(given) {
	var min = Math.floor((given % 3600) / 60);
	var sec = Math.floor(given % 60);

	// add a leading zero
	min = (min < 10) ? "0" + min : min;
	sec = (sec < 10) ? "0" + sec : sec;

	return min + ':' + sec;
}

/**
 * if th document is ready,
 */
$(document).ready(function() {
	// grab the video/audio element
	var element = $($('#choice').val()).get(0);
	$('#choice').change(function() {
		element = document.getElementById($(this).val());
	});

	// get the video/audio length and paste it, if the loadedmetadata event is
	// fired
	$(element).bind('loadedmetadata', function() {
		$('#duration').html(transSec(element.duration));
	});

	/**
	 * add click events to the buttons
	 */

	$('#playButton').click(function() {
		var interval;
		if (element.paused) { // check if the video/audio is paused
			element.play(); // start the video/audio
			$(this).html('stop!'); // change the text on the button
			// create an interval to update the shown timestamp
			interval = setInterval(function() {
				$('#shown').html(transSec(element.currentTime));
			}, 1000);
		} else {
			clearInterval(interval); // cancel the Interval
			element.pause(); // paused the video/audio
			$(this).html('play!'); // change the button text back
		}
	});

	$('#muteButton').click(function() {
		if (element.muted) { // check if the video/audio is muted
			$(this).html('mute!'); // change the button text
			element.muted = false; // unmute the video/audio
		} else {
			$(this).html('unmute!'); // change the text again
			element.muted = true; // mute the video/audio
		}
	});
});