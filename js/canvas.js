// defining the effects
var effects = {
	/*
	 * no effect
	 */
	none : function(data) {
		return data;
	},
	/*
	 * invert / ACID effect
	 */
	invert : function(data) {
		var length = data.length;
		var counter = 0;
		while (counter < length) {
			// invert the colors except the alpha channel
			for ( var i = 0; i < 4; i++) {
				data[counter] = (i == 3) ? data[counter] : 255 - data[counter];
				counter++;
			}
		}
		return data;
	},
	/*
	 * grey scale
	 */
	grey : function(data) {
		var length = data.length;
		for ( var i = 0; i < length; i += 4) {
			// get the channels
			var r = data[i + 0]; // R
			var g = data[i + 1]; // G
			var b = data[i + 2]; // B
			var a = data[i + 3]; // A
			// calculate the grey value
			var grey = (r + g + b) / 3;

			// set all channels to grey except the alpha
			data[i + 0] = grey; // R
			data[i + 1] = grey; // G
			data[i + 2] = grey; // B
			data[i + 3] = 255; // A
		}
		return data;
	},
	/*
	 * dynamic edge detection with 4 different matrices
	 */
	edge_detection : function(data, width, height, matrix) {
		var length = data.length;
		var w = width;
		var h = height;
		// walk through the image data
		for ( var x = 0; x < w; x++) {
			for ( var y = 0; y < h; y++) {
				// collection array
				var P = new Array();
				var count = 0;
				var len = (matrix != 3) ? 2 : 3; // define the
				// size of the
				// sliding
				// window
				// walk through the sliding window
				for ( var u = 0; u < len; u++) {
					for ( var v = 0; v < len; v++) {
						// calculate the index of the sliding
						// window
						var windowIndex = ((x + u) + (y + v) * width) * 4;
						// get the color values
						var r = data[windowIndex + 0]; // R
						var g = data[windowIndex + 1]; // G
						var b = data[windowIndex + 2]; // B
						var a = data[windowIndex + 3]; // A
						// calculate the grey value and save it
						// to the prepaired array
						P[count] = (r + g + b) / 3;
						count++;
					}
				}
				// defining the matrix functions
				var m = {
					0 : function(P) {
						// Roberts operator
						// 1 0
						// 0 -1
						return (P[0] - P[3] + 255) / 2;
					},
					1 : function(P) {
						// simple horizontal operator
						// 1 -1
						// 1 -1
						return (P[0] - P[1] + P[2] - P[3] + 510) / 4;
					},
					2 : function(P) {
						// simple vertical operator
						// 1 1
						// -1 -1
						return (P[0] + P[1] - P[2] - P[3] + 510) / 4;
					},
					3 : function(P) {
						// Laplace operator
						// 0 1 0
						// 1 -4 1
						// 0 1 0
						return P[1] + P[3] - 4 * P[4] + P[5] + P[7];
					}
				}
				// choose the selected matrix from the array
				// and hand over the array with the grey values
				var value = m[matrix].apply(null, [ P ]);

				// calculate the index of the image
				var imageIndex = (x + y * width) * 4;

				// save the grey value to the color channels
				data[imageIndex + 0] = value; // R
				data[imageIndex + 1] = value; // G
				data[imageIndex + 2] = value; // B
				// set alpha
				data[imageIndex + 3] = 255; // A
			}
		}
		return data;
	}
}

// on DOMready
$(document).ready(
		function() {
			// save the elements in a variable
			var origVideo = document.getElementById('origVideo');
			var canvasVideo = document.getElementById('canvasVideo');
			// get the context of the shown canvas
			var contextCanvasVideo = canvasVideo.getContext('2d');

			// create a second HIDDEN canvas
			var hiddenCanvas = document.createElement('canvas');
			// get the context of this hidden canvas
			var contextHiddenCanvas = hiddenCanvas.getContext('2d');

			// set the size
			hiddenCanvas.width = canvasVideo.width;
			hiddenCanvas.height = canvasVideo.height;

			// create a loop interval to call the drawToCanvas() function
			// by pressing play
			var interval;
			$('#origVideo').bind('play', function() {
				interval = setInterval(function() {
					drawToCanvas();
				}, 25);
			});

			// set the default effect
			var effect = 'none';
			// bind an event to the effect select field
			$('#effect').bind('change', function() {
				// get the value of the field
				effect = $('#effect').val();

				// check if we have to display more options
				if (effect == 'edge_detection') {
					$('#edge_detection').css('display', 'block');
				} else
					$('#edge_detection').css('display', 'none');
			});

			// set the default matrix
			var matrix = 0;
			// bind a change event to the radio's
			$('input[name="matrix"]').bind('change', function() {
				// get the checked value from the radio's
				matrix = $('input[name="matrix"]:checked').val();
			});
			/*
			 * This is the drawing function which will be looped
			 */
			function drawToCanvas() {
				// check if the video is paused or ended
				if (origVideo.paused || origVideo.ended) {
					// delete the loop interval
					clearInterval(interval);
				}
				// draw the video on the hidden canvas
				// only by this way we could get the imageData
				contextHiddenCanvas.drawImage(origVideo, 0, 0, 400, 225);

				// get the imageData from the hidden canvas
				var imageData = contextHiddenCanvas
						.getImageData(0, 0, 400, 225);

				// choose the selected effect from the defined array
				// and hand over the data and some other optional data
				imageData.data = effects[effect].apply(null, [ imageData.data,
						imageData.width, imageData.height, matrix ]);

				// draw the image data to the displayed canvas
				contextCanvasVideo.putImageData(imageData, 0, 0);
			}
		});