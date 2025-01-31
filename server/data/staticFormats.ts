import { Format } from '../models/format.ts';
const staticFormats: { [key: string]: Format } = {
    'Date': {
        pattern: '^\\d{4}-\\d{2}-\\d{2}$', // YYYY-MM-DD
        description: 'Date in the format YYYY-MM-DD',
    },
    'Time': {
        pattern: '^\\d{2}:\\d{2}:\\d{2}$', // HH:mm:ss
        description: 'Time in the format HH:mm:ss',
    },
    'Date & Time': {
        pattern: '^\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}$', // YYYY-MM-DD HH:mm:ss
        description: 'Date & Time in the format YYYY-MM-DD HH:mm:ss',
    },
    'Email': {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
        description: 'Email address',
    },
    'Phone Number': {
        pattern: '^\\+?[0-9]{1,3}-?[0-9]{3,}$',
        description: 'Phone number',
    },
    'ZIP Code': {
        pattern: '^[0-9]{5}(?:-[0-9]{4})?$',
        description: 'ZIP Code',
    },
    'Credit Card Number': {
        pattern: '^[0-9]{4}-?[0-9]{4}-?[0-9]{4}-?[0-9]{4}$',
        description: 'Credit Card Number',
    },
    'IPv4 Address': {
        pattern: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$',
        description: 'IPv4 Address',
    },
    'IPv6 Address': {
        pattern: '^([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}$',
        description: 'IPv6 Address',
    },
    'URL': {
        pattern: '^(https?|ftp)://[^\\s/$.?#].[^\\s]*$',
        description: 'URL'
    },
    'Slug': {
        pattern: '^[a-z0-9-]+$',
        description: `A slug is a string used to identify a resource in a URL. It contains only lowercase letters, numbers, and hyphens.`,
    },
    'UUID': {
        pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        description: 'UUID',
    },
    'Hexadecimal': {
        pattern: '^[0-9a-fA-F]+$',
        description: 'Hexadecimal number',
    },
    'Base64': {
        pattern: '^[a-zA-Z0-9-_]+$',
        description: 'Base64 encoded string',
    },
    'JSON': {
        pattern: '^\\{.*\\}$',
        description: 'JSON object',
    },
    'JWT': {
        pattern: '^[a-zA-Z0-9-_]+\\.[a-zA-Z0-9-_]+\\.[a-zA-Z0-9-_]+$',
        description: 'JSON Web Token',
    }
}
export default staticFormats;