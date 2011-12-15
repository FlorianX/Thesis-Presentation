/**
 * Imageprocessing
 */
// create new image
var image = new Image();
// ImageData object from the initial image
var imageData;

/*
 * Onload method to draw the initial image in the frist canvas.
 */
function drawCanvas() {
	// get the canvas
	var canvas = document.getElementById('start');
	// check if canvas is supported
	if (canvas.getContext) {
		// get the 2D context
		var context = canvas.getContext('2d');
		// get the image path from the select field to load it
		image.src = $('#file').val();
		// the image must be loaded before we can draw it
		image.onload = function() {
			// cleans the canvas
			canvas.width = canvas.width;
			// drawing the loaded image
			context.drawImage(image, 0, 0);
			// save the image data to the gloabel ImageData object
			imageData = context.getImageData(0, 0, image.width, image.height);
			drawHistogram();
		}

	} else {
		alert('not supported!');
	}
}
/*
 * This function inverts the image data and draw it back to a new canvas.
 */
function doInvert() {
	// get the canvas
	var canvas = document.getElementById('invert');
	// check if canvas is supported
	if (canvas.getContext) {
		// cleans the canvas
		canvas.width = canvas.width;
		// get the 2D context
		var context = canvas.getContext('2d');

		// create a new ImageData object
		var newImageData = context.createImageData(imageData.width,
				imageData.height);

		var i = 0;
		while (i < imageData.data.length) {
			// invert the colors
			newImageData.data[i] = 255 - imageData.data[i++]; // R
			newImageData.data[i] = 255 - imageData.data[i++]; // G
			newImageData.data[i] = 255 - imageData.data[i++]; // B
			newImageData.data[i] = imageData.data[i++]; // A
		}
		// draw the inverted image data to the second canvas
		context.putImageData(newImageData, 0, 0);
	}
}
/*
 * This function uses a median filter for noise reduction.
 */
function doReduction() {
	// get the canvas
	var canvas = document.getElementById('medianfilter');
	// check if canvas is supported
	if (canvas.getContext) {
		// cleans the canvas
		canvas.width = canvas.width;
		// get the 2D context
		var context = canvas.getContext('2d');
		// create a new ImageData object
		var newImageData = context.createImageData(imageData.width,
				imageData.height);

		// move over the image data
		for ( var x = 0; x < imageData.width; x++) {
			for ( var y = 0; y < imageData.height; y++) {
				// collection array for median filter
				var P = new Array();
				var count = 0;

				// move with a little window over the image
				for ( var u = 0; u < 3; u++) {
					for ( var v = 0; v < 3; v++) {
						// calculate the index of the sliding window
						var windowIndex = ((x + u) + (y + v) * imageData.width) * 4;
						// get the color values
						var r = imageData.data[windowIndex + 0]; // R
						var g = imageData.data[windowIndex + 1]; // G
						var b = imageData.data[windowIndex + 2]; // B
						var a = imageData.data[windowIndex + 3]; // A
						// calculate the grey value and save it to the prepaired
						// array
						P[count] = parseInt(parseFloat("0.33")
								* (parseFloat(r) + parseFloat(g) + parseFloat(b)));
						count++;
					}
				}
				// sorting the array
				P.sort();
				// calculate the index of the image
				var imageIndex = (x + y * imageData.width) * 4;
				// save the median to the single color positions
				newImageData.data[imageIndex + 0] = parseInt(P[4]); // R
				newImageData.data[imageIndex + 1] = parseInt(P[4]); // G
				newImageData.data[imageIndex + 2] = parseInt(P[4]); // B
				// set the original alpha
				newImageData.data[imageIndex + 3] = imageData.data[imageIndex + 3]; // A
			}
		}
		// draw the inverted image data to the second canvas
		context.putImageData(newImageData, 0, 0);
	}
}

/*
 * This function draws the histogram for the initial image.
 */
function drawHistogram() {
	// histogram array
	var hist = Array();
	// max grey value
	var max = 0;

	var i = 0;
	while (i < imageData.data.length) {
		// get the colors
		var r = imageData.data[i++]; // R
		var g = imageData.data[i++]; // G
		var b = imageData.data[i++]; // B
		var a = imageData.data[i++]; // A
		// calculate the grey value
		var grey = parseInt(parseFloat("0.33")
				* (parseFloat(r) + parseFloat(g) + parseFloat(b)));

		// increase the value in the histogram on this position by 1
		if (grey > -1 && grey < 256) {
			hist[grey] = (!hist[grey]) ? 1 : hist[grey] + 1;
			// get the max value
			if (max < hist[grey])
				max = hist[grey];
		}
	}

	// get the canvas
	var canvas = document.getElementById('histogram');
	// check if canvas is supported
	if (canvas.getContext) {
		// cleans the canvas
		canvas.width = canvas.width;
		// get the 2D context
		var context = canvas.getContext('2d');

		// draw a rect as background
		context.fillStyle = 'rgba(123,12,134,167)';
		context.fillRect(0, 0, canvas.width, canvas.height);

		// walk through the values and draw rectangles
		for ( var i = 0; i < 256; i++) {
			var value = 0;
			if (max > 0)
				value = parseInt((100 * parseFloat(hist[i]) / parseFloat(max)));

			context.fillStyle = 'rgb(' + i + ', ' + i + ', ' + i + ')';
			context.fillRect(i, 100 - value, 1, value);
			context.fillRect(i, 100, 1, 33);
			context.fillRect(0, 100, 256, 5);

		}
	}

}
// append an onchange event
$('#file').change(function() {
	image.src = $('#file').val();
});