/**
 * Generates a dummy UUID.
 *
 * The function follows the pattern 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',
 * where each 'x' is replaced with a random hexadecimal digit,
 * and 'y' is replaced with a random hexadecimal digit from the set [8, 9, A, or B].
 *
 * @returns {string} The generated dummy UUID.
 */

 function generateUUID() {
   return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
     const r = (Math.random() * 16) | 0,
       v = c === "x" ? r : (r & 0x3) | 0x8;
     return v.toString(16);
   });
 }

 module.exports = generateUUID;