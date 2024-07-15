/**
 * Converts a Uint8Array to a String.
 *
 * @param {Uint8Array} arr Array that should be converted
 * @param {Number} offset Array offset in case only subset of array items should be extracted (default: 0)
 * @param {Number} limit Maximum number of array items that should be extracted (defaults to length of array)
 * @returns {String}
 */
function uint8ArrayToString(arr, offset, limit) {
	offset = offset || 0;
	limit = limit || arr.length - offset;
	let str = '';
	for (let i = offset; i < offset + limit; i++) {
		str += String.fromCharCode(arr[i]);
	}
	return str;
}

/**
 * Converts a String to a Uint8Array.
 *
 * @param {String} str String that should be converted
 * @returns {Uint8Array}
 */
function stringToUint8Array(str) {
	const arr = new Uint8Array(str.length);
	for (let i = 0, j = str.length; i < j; i++) {
		arr[i] = str.charCodeAt(i);
	}
	return arr;
}

/**
 * Identifies the boundary in a multipart/related message header.
 *
 * @param {String} header Message header
 */
function identifyBoundary(header) {
	const parts = header.split('\r\n');

	for (let i = 0; i < parts.length; i++) {
		if (parts[i].substring(0, 2) === '--') {
			return parts[i];
		}
	}
}

/**
 * Checks whether a given token is contained by a message at a given offset.
 *
 * @param {Uint8Array} message Message content
 * @param {Uint8Array} token Substring that should be present
 * @param {Number} offset Offset in message content from where search should start
 * @returns {Boolean} Whether message contains token at offset
 */
function containsToken(message, token, offset = 0) {
	if (offset + token.length > message.length) {
		return false;
	}

	let index = offset;
	for (let i = 0; i < token.length; i++) {
		if (token[i] !== message[index++]) {
			return false;
		}
	}
	return true;
}

/**
 * Finds a given token in a message at a given offset.
 *
 * @param {Uint8Array} message Message content
 * @param {Uint8Array} token Substring that should be found
 * @param {Number} offset Message body offset from where search should start
 * @param {number | undefined} [maxSearchLength]
 * @returns Whether message has a part at given offset or not
 */
function findToken(message, token, offset = 0, maxSearchLength) {
	let searchLength = message.length;
	if (maxSearchLength) {
		searchLength = Math.min(offset + maxSearchLength, message.length);
	}

	for (let i = offset; i < searchLength; i++) {
		// If the first value of the message matches
		// the first value of the token, check if
		// this is the full token.
		if (message[i] === token[0]) {
			if (containsToken(message, token, i)) {
				return i;
			}
		}
	}

	return -1;
}

/**
 * @typedef {Object} MultipartEncodedData
 * @property {ArrayBuffer} data The encoded Multipart Data
 * @property {String} boundary The boundary used to divide pieces of the encoded data
 */

/**
 * Encode one or more DICOM datasets into a single body, so it can be sent using the Multipart Content-Type.
 *
 * @param {ArrayBuffer[]} datasets Array containing each file to be encoded in the multipart body, passed as
 *   ArrayBuffers.
 * @param {String} [boundary] Optional string to define a boundary between each part of the multipart body. If this is
 *   not specified, a random GUID will be generated.
 * @param contentType The content type of the data being sent. Default is 'application/dicom'.
 * @returns {MultipartEncodedData} The Multipart encoded data returned as an Object. This contains both the data itself,
 *   and the boundary string used to divide it.
 */
function multipartEncode(datasets, boundary = guid(), contentType = 'application/dicom') {
	const contentTypeString = `Content-Type: ${contentType}`;
	const header = `\r\n--${boundary}\r\n${contentTypeString}\r\n\r\n`;
	const footer = `\r\n--${boundary}--`;
	const headerArray = stringToUint8Array(header);
	const footerArray = stringToUint8Array(footer);
	const headerLength = headerArray.length;
	const footerLength = footerArray.length;

	let length = 0;

	// Calculate the total length for the final array
	const contentArrays = datasets.map((datasetBuffer) => {
		const contentArray = new Uint8Array(datasetBuffer);
		const contentLength = contentArray.length;

		length += headerLength + contentLength + footerLength;

		return contentArray;
	});

	// Allocate the array
	const multipartArray = new Uint8Array(length);

	// Set the initial header
	multipartArray.set(headerArray, 0);

	// Write each dataset into the multipart array
	let position = 0;
	contentArrays.forEach((contentArray) => {
		multipartArray.set(headerArray, position);
		multipartArray.set(contentArray, position + headerLength);

		position += headerLength + contentArray.length;
	});

	multipartArray.set(footerArray, position);

	return {
		data: multipartArray.buffer,
		boundary,
	};
}

/**
 * Decode a Multipart encoded ArrayBuffer and return the components as an Array.
 *
 * @param {ArrayBuffer} response Data encoded as a 'multipart/related' message
 * @returns The content
 */
export function multipartDecode(response) {
	const message = new Uint8Array(response);

	/* Set a maximum length to search for the header boundaries, otherwise findToken can run for a long time*/
	const maxSearchLength = 1000;

	// First look for the multipart mime header
	let separator = stringToUint8Array('\r\n\r\n');
	let headerIndex = findToken(message, separator, 0, maxSearchLength);
	if (headerIndex === -1) {
		throw new Error('Response message has no multipart mime header');
	}

	const header = uint8ArrayToString(message, 0, headerIndex);
	const boundaryString = identifyBoundary(header);
	if (!boundaryString) {
		throw new Error('Header of response message does not specify boundary');
	}

	const boundary = stringToUint8Array(boundaryString);
	const components = [];

	let offset = headerIndex + separator.length;

	// Loop until we cannot find any more boundaries
	let boundaryIndex;

	while (boundaryIndex !== -1) {
		// Search for the next boundary in the message, starting
		// from the current offset position
		boundaryIndex = findToken(message, boundary, offset);

		// If no further boundaries are found, stop here.
		if (boundaryIndex === -1) {
			break;
		}

		// Extract data from response message, excluding "\r\n"
		const spacingLength = 2;
		const length = boundaryIndex - offset - spacingLength;
		const data = response.slice(offset, offset + length);

		// Add the data to the array of results
		components.push(data);

		// find the end of the boundary
		var boundaryEnd = findToken(message, separator, boundaryIndex + 1, maxSearchLength);
		if (boundaryEnd === -1) break;
		// Move the offset to the end of the identified boundary
		offset = boundaryEnd + separator.length;
	}
	return components;
}

/**
 * Create a random GUID
 *
 * @returns {string}
 */
function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
