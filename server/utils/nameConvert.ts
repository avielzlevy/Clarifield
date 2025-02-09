export const toWords = (str: string): string[] => {
  return (
    str
      // Insert space before any uppercase letter following a lowercase or number
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      // Insert space between sequences of uppercase letters and lowercase letters
      .replace(/([A-Z]+)([A-Z][a-z0-9])/g, "$1 $2")
      // Replace underscores, hyphens, and multiple spaces with a single space
      .replace(/[_\-\s]+/g, " ")
      // Trim leading and trailing spaces
      .trim()
      // Split the string into words
      .split(" ")
      // Convert all words to lowercase
      .map((word) => word.toLowerCase())
  );
};

export const toSnakeCase = (str: string): string => {
  return toWords(str).join("_");
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
    .join("");
};

export const toPascalCase = (str: string): string => {
  return toWords(str)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
};

export const toKebabCase = (str: string): string => {
  return toWords(str).join("-");
};
export const transformKeys = (
  obj: any,
  transformFunction: (str: string) => string
): any => {
  if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
        const newKey = transformFunction(key);
        newObj[newKey] = obj[key];
    }
    return newObj;
  } else {
    return obj;
  }
};
/*
  {
  "appointments": {
    "label": "appointments",
    "fields": [
      {
        "label": "registrationDate",
        "type": "definition"
      },
      {
        "label": "date",
        "type": "definition"
      },
      {
        "label": "time",
        "type": "definition"
      },
      {
        "label": "employee",
        "type": "entity"
      }
    ]
  },
  "user": {
    "label": "user",
    "fields": [
      {
        "label": "firstName",
        "type": "definition"
      },
      {
        "label": "appointments",
        "type": "entity"
      }
    ]
  },
  "employee": {
    "label": "employee",
    "fields": [
      {
        "label": "id",
        "type": "definition"
      },
      {
        "label": "employeeId",
        "type": "definition"
      },
      {
        "label": "firstName",
        "type": "definition"
      },
      {
        "label": "lastName",
        "type": "definition"
      },
      {
        "label": "email",
        "type": "definition"
      }
    ]
  }
}
  */
export const transformEntityKeys = (
  obj: any,
  transformFunction: (str: string) => string,
  isRoot: boolean = true
): any => {
  if (Array.isArray(obj)) {
    // For arrays, process each element.
    return obj.map((item) =>
      transformEntityKeys(item, transformFunction, false)
    );
  } else if (obj !== null && typeof obj === "object") {
    const newObj: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        // At the root level, transform the key name.
        const newKey = isRoot ? transformFunction(key) : key;

        // If the property is "label" and its value is a string, transform its value.
        if (key === "label" && typeof obj[key] === "string") {
          newObj[newKey] = transformFunction(obj[key]);
        } else {
          // Otherwise, recursively process the property.
          newObj[newKey] = transformEntityKeys(
            obj[key],
            transformFunction,
            false
          );
        }
      }
    }
    return newObj;
  } else {
    // For non-objects (primitive values), return as-is.
    return obj;
  }
};