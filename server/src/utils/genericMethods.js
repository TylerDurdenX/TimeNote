export function isEmpty(value) {
    if (value == null) return true; 
    
    if (typeof value === 'string' && value.trim() === '') return true;
    
    if (Array.isArray(value) && value.length === 0) return true;
    
    if (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0) return true;
    
    if ((value instanceof Map || value instanceof Set) && value.size === 0) return true;
    
    return false; 
  }

  export function extractTitles(inputArray) {
    return inputArray.map(item => item.title);
  }