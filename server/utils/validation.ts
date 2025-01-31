import { Context } from "../deps.ts";
import { Definition } from "../models/definition.ts";
import { Format } from "../models/format.ts";
import staticFormats from "../data/staticFormats.ts";

const DEFINITIONS_FILE_PATH = "./data/definitions.json";
const FORMATS_FILE_PATH = "./data/formats.json";

const readDefinitions = async (): Promise<{ [name: string]: Definition }> => {
  try {
    const data = await Deno.readTextFile(DEFINITIONS_FILE_PATH);
    return JSON.parse(data);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      await Deno.writeTextFile(DEFINITIONS_FILE_PATH, "{}");
    }
    return {};
  }
};

const readFormats = async (): Promise<{ [name: string]: Format }> => {
  try {
    const data = await Deno.readTextFile(FORMATS_FILE_PATH);
    return JSON.parse(data);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      await Deno.writeTextFile(FORMATS_FILE_PATH, "{}");
    }
    return {};
  }
};

// Helper function for recursive validation
const validateObject = (
  obj: any,
  definitions: { [name: string]: Definition },
  formats: { [name: string]: Format },
  errors: string[],
  path: string = ""
) => {
  for (const key of Object.keys(obj)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!definitions[key]) {
      errors.push(`Key "${currentPath}" is not defined in the policy`);
      continue;
    }

    const definition = definitions[key];
    const format = formats[definition.format];
    if (!format) {
      errors.push(`Definition for "${currentPath}" references unknown format "${definition.format}"`);
      continue;
    }

    const value = obj[key];
    
    // If the value is an object and the format allows nested objects
    if (typeof value === "object" && value !== null) {
      validateObject(value, definitions, formats, errors, currentPath);
    } else {
      if (!new RegExp(format.pattern).test(String(value))) {
        errors.push(`Invalid value ${value} for "${currentPath}": does not match the pattern "${format.pattern}"`);
      }
    }
  }
};

const validate = async (ctx: Context) => {
  const body = ctx.request.body({ type: "json" });
  let value;
  
  try {
    value = await body.value;
  } catch (e) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid JSON body" };
    return;
  }

  const definitions = await readDefinitions();
  const formatsFromFile = await readFormats();
  const formats = { ...staticFormats, ...formatsFromFile };
  const errors: string[] = [];

  // Start recursive validation
  validateObject(value, definitions, formats, errors);

  if (errors.length) {
    ctx.response.status = 400;
    ctx.response.body = errors;
    return;
  }

  ctx.response.status = 200;
  ctx.response.body = { message: "All values are valid" };
};

export default validate;
