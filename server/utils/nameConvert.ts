export const toWords = (str: string): string[] => {
    return str
      // Insert space before any uppercase letter following a lowercase or number
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      // Insert space between sequences of uppercase letters and lowercase letters
      .replace(/([A-Z]+)([A-Z][a-z0-9])/g, '$1 $2')
      // Replace underscores, hyphens, and multiple spaces with a single space
      .replace(/[_\-\s]+/g, ' ')
      // Trim leading and trailing spaces
      .trim()
      // Split the string into words
      .split(' ')
      // Convert all words to lowercase
      .map((word) => word.toLowerCase());
  };
  
  export const toSnakeCase = (str: string): string => {
    return toWords(str).join('_');
  };
  
  export const toCamelCase = (str: string): string => {
    const words = toWords(str);
    return words
      .map((word, index) => {
        // Lowercase the first word for camelCase
        if (index === 0) return word;
        // Capitalize the first letter of subsequent words
        return word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join('');
  };
  
  export const toPascalCase = (str: string): string => {
    return toWords(str)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  };
  
  export const toKebabCase = (str: string): string => {
    return toWords(str).join('-');
  };

  
  export const transformKeys = (
    obj: any,
    transformFunction: (str: string) => string
  ): any => {
    if (Array.isArray(obj)) {
      return obj.map((item) => transformKeys(item, transformFunction));
    } else if (obj !== null && typeof obj === 'object') {
      const newObj: any = {};
      for (const key in obj) {
        if (obj[key]) {
          const newKey = transformFunction(key);
          newObj[newKey] = transformKeys(obj[key], transformFunction);
        }
      }
      return newObj;
    } else {
      return obj;
    }
  };
