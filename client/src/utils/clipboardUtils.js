// utils/clipboardUtils.js
export const determineRegexType = (pattern) => {
    const testValues = {
      integer: ['0', '-1', '42'],
      number: ['3.14', '-2.718', '0', '100', '-50'],
      boolean: ['true', 'false', 'True', 'FALSE', 'TRUE', 'False'],
      string: ['hello', 'world33', '123', 'true'],
    };
  
    const matchesAll = (values) =>
      values.every((value) => {
        const newRegex = new RegExp(pattern);
        return newRegex.test(value);
      });
  
    if (matchesAll(testValues.integer)) return 'integer';
    if (matchesAll(testValues.number)) return 'number';
    if (matchesAll(testValues.boolean)) return 'boolean';
    return 'string';
  };
  
  export const generateSampleValue = (field) => {
    const { type, format } = field;
    switch (type.toLowerCase()) {
      case 'string':
        if (format) {
          if (format === 'email') return 'user@example.com';
          if (format.startsWith('^') && format.endsWith('$')) {
            return format === '^[a-zA-Z0-9_]+$' ? 'user_123' : 'sampleString';
          }
          return 'sampleString';
        }
        return 'sampleString';
      case 'number':
        return 42;
      case 'boolean':
        return true;
      case 'array':
        return field.items && field.items.type ? [generateSampleValue(field.items)] : [];
      case 'object':
        return field.properties ? generateSampleObject(field.properties) : {};
      default:
        return null;
    }
  };
  
  export const generateSampleObject = (schema) => {
    const sampleObject = {};
    schema.forEach((field) => {
      sampleObject[field.name] = generateSampleValue(field);
    });
    return sampleObject;
  };
  
  // You can also move your handleCopy logic here if desired.
  