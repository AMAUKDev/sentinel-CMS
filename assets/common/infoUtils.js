/**
 * Convert a text string to human-readable format.
 * @param {string} text - The text to convert.
 * @returns {string} - The human-readable text.
 */
export function toHumanReadable(text) {
  // Check if the text contains 'GPS'
  if (text.toUpperCase().includes('GPS')) {
    // Split the text into words
    const words = text.split('_');
    // Capitalize the first letter of each word
    return words[0].toUpperCase() + ' ' +  words.slice(1).join(' ');
  } else if (text.includes('MSL')) {
    return text;
  } else if (text.includes('swh')) {
    return 'Significant Wave Height';
  } else if (text.toLowerCase().includes('sog')) {
    return 'Speed Over Ground';
  } else if (/^[a-z]+(?:[A-Z0-9]|(?<=[a-z])[0-9]+)/.test(text)) {
    // Convert camelCase to human-readable and capitalize the start of each word
    let withSpaces = text.replace(/([a-z])([A-Z0-9])/g, '$1 $2').toLowerCase();
    // Insert space before digits followed by letters
    withSpaces = withSpaces.replace(/([a-zA-Z])(\d)/g, '$1 $2');
    // Capitalize the start of each word except 'and'
    withSpaces = withSpaces.replace(/(^|\s)(?!and\b)\w/g, match => match.toUpperCase());
    // Return the result
    return withSpaces;
  } else {
    // Check if the text has a length of 3
    if (text.length === 3) {
      // Capitalize the entire string
      return text.toUpperCase();
    }
    // Convert snake_case to human-readable and capitalize the start of each word
    return text
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

/**
 * Check if a property name is likely a timestamp property.
 * @param {string} propertyName - The property name to check.
 * @returns {boolean} - True if the property name is likely a timestamp property, otherwise false.
 */
export function isTimestampProperty(propertyName){
  // Add conditions based on your specific property names
  return propertyName.includes('datetime') ||
  propertyName.includes('time') ||
  propertyName.includes('Date') ||
  propertyName.includes('ETA');
}

/**
 * Convert a timestamp to a JavaScript Date object.
 * @param {number} timestamp - The timestamp to convert.
 * @returns {Date} - The JavaScript Date object representing the timestamp.
 */
export function convertTimeStamp(timestamp){
  if (timestamp.toString().length === 10) {
    // If the timestamp is 10 digits, assume it's in seconds
    return new Date(timestamp * 1000); // Convert to milliseconds
  } else {
    // Otherwise, assume it's already in milliseconds
    return new Date(timestamp);
  }
}
