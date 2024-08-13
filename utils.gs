/**
 * generate a UUID
 * @return {String} UUID
 */
function uuid() {
  // Initialize variables for the UUID components
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
  
  // Generate the UUID
  const uuid = template.replace(/[xy]/g, function (c) {
    // Generate a random number
    const r = Math.random() * 16 | 0;
    
    // Set the value of v based on c
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    
    // Return the hexadecimal value
    return v.toString(16);
  });
  
  // Return the generated UUID
  return uuid;
}