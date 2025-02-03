import { Context } from "../deps.ts";
import { Entity } from "../models/entities.ts";

const DATA_FILE = "./data/entities.json";
// Utility functions to read and write the analytics file
const readEntities = async () => {
  try {
    const data = await Deno.readTextFile(DATA_FILE);
    return JSON.parse(data);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      await Deno.writeTextFile(DATA_FILE, "{}");
    }
    return {};
  }
};

function validateEntity(
  entity: any,
  definitions: Record<string, any>,
  path: string = ""
): string[] {
  const errors: string[] = [];

  // If entity isn’t an object, there’s nothing to validate.
  if (typeof entity !== "object" || entity === null) {
    return errors;
  }

  for (const key in entity) {
    // Build a full “path” to the field for useful error messages.
    const currentPath = path ? `${path}.${key}` : key;
    const value = entity[key];

    // ── CASE 1: The key exists in definitions ──
    // In this case we assume that the field’s “format” (or type) is validated
    // by the definition. We do not recurse into its value—even if it’s an object.
    if (key in definitions) {
      continue;
    }

    // ── CASE 2: The key is NOT in definitions ──
    // We assume that this key holds a nested entity (or entities) and we must validate
    // its inner fields.
    if (Array.isArray(value)) {
      // For arrays, we validate each element if it is an object.
      value.forEach((item, index) => {
        if (typeof item === "object" && item !== null) {
          errors.push(
            ...validateEntity(item, definitions, `${currentPath}[${index}]`)
          );
        } else {
          // If the array item is a primitive, then it should have been defined.
          errors.push(
            `Field "${currentPath}[${index}]" is not defined in definitions.json`
          );
        }
      });
    } else if (typeof value === "object" && value !== null) {
      // For a nested object, validate its properties recursively.
      errors.push(...validateEntity(value, definitions, currentPath));
    } else {
      // If we have a primitive value and its key wasn’t defined,
      // that’s an error.
      errors.push(`Field "${currentPath}" is not defined in definitions.json`);
    }
  }

  return errors;
}
const writeEntities = async (entities: { [type: string]: Entity }) => {
  // Read the definitions from definitions.json.
  const definitionsData = await Deno.readTextFile("./data/definitions.json");
  const definitions = JSON.parse(definitionsData);

  // Validate each entity (by type) recursively.
  const errors: string[] = [];
  for (const entityType in entities) {
    const entity = entities[entityType];
    // The entity name is used as the root path.
    errors.push(...validateEntity(entity, definitions, entityType));
  }

  // If there are any errors, throw an error and stop.
  if (errors.length > 0) {
    throw new Error("Validation errors: " + errors.join("; "));
  }

  // If validation passes, write the entities to file.
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
};
// Get all analytics
export const getEntities = async (ctx: Context) => {
  const entities = await readEntities();
  ctx.response.body = entities;
};
// Add or update a report
export const addEntity = async (ctx: Context) => {
  const { value } = ctx.request.body({
    type: "json",
  });
  const { name, children } = await value;
  // Validate input
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = {
      message: "Invalid entity data",
    };
    return;
  }
  const entities = await readEntities();
  // Add or update the report under the type and name
  if (entities[name]) {
    ctx.response.status = 409;
    ctx.response.body = {
      message: "Entity already exists",
    };
    return;
  }
  entities[name] = { label: name, children };
  await writeEntities(entities);
  ctx.response.status = 201;
  ctx.response.body = {
    message: "Entity added successfully",
    name,
    children,
  };
};
