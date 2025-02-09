import { Context, RouterContext } from "../deps.ts";
import { Entity } from "../models/entities.ts";

const DATA_FILE = "./data/entities.json";

/**
 * Reads the entities from the DATA_FILE.
 * If the file doesn't exist, it creates an empty JSON object.
 */
export const readEntities = async (): Promise<Record<string, Entity>> => {
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

export const writeEntities = async (entities: Record<string, Entity>) => {
  // If all validations pass, write the entities to the data file.
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
};

export const getEntities = async (ctx: Context) => {
  const entities = await readEntities();
  ctx.response.body = entities;
};

export const addEntity = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const { label, fields } = await value;

  // Validate input: label must be present and fields must be an array.
  if (!label || !fields || !Array.isArray(fields)) {
    ctx.response.status = 400;
    ctx.response.body = {
      message:
        "Invalid entity data. 'label' and 'fields' (as an array) are required.",
    };
    return;
  }
  // validate fields
  for (const field of fields) {
    if (!field.label || !field.type) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Invalid field data. 'label' and 'type' are required.",
      };
      return;
    }
    switch (field.type) {
      case "definition": {
        const definitionsData = await Deno.readTextFile(
          "./data/definitions.json"
        );
        const definitions = JSON.parse(definitionsData);
        if (!definitions[field.label]) {
          ctx.response.status = 400;
          ctx.response.body = {
            message: `Invalid field data. '${field.label}' must be an existing definition.`,
          };
          return;
        }
        break;
      }
      case "entity": {
        const entitiesData = await Deno.readTextFile("./data/entities.json");
        const entities = JSON.parse(entitiesData);
        if (!entities[field.label]) {
          ctx.response.status = 400;
          ctx.response.body = {
            message: `Invalid field data. '${field.label}' must be an existing entity.`,
          };
          return;
        }
        break;
      }
      default: {
        ctx.response.status = 400;
        ctx.response.body = {
          message:
            "Invalid field data. 'type' must be 'definition' or 'entity'.",
        };
        return;
      }
    }
  }

  const entities = await readEntities();

  // Check if an entity with the same label already exists.
  if (entities[label]) {
    ctx.response.status = 409;
    ctx.response.body = {
      message: "Entity already exists",
    };
    return;
  }

  // Create the new entity.
  const newEntity: Entity = { label, fields };

  // Add the new entity to the collection.
  entities[label] = newEntity;

  // Validate and write the entities.
  try {
    await writeEntities(entities);
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Entity added successfully",
      entity: newEntity,
    };
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { message: error };
  }
};

export const updateEntity = async (
  ctx: RouterContext<"/api/entity/:name", { name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid entity name" };
    return;
  }

  const { value } = ctx.request.body({ type: "json" });
  const { label, fields } = await value;

  // Validate input: label must be present and fields must be an array.
  if (!label || !fields || !Array.isArray(fields)) {
    ctx.response.status = 400;
    ctx.response.body = {
      message:
        "Invalid entity data. 'label' and 'fields' (as an array) are required.",
    };
    return;
  }
  // validate fields
  for (const field of fields) {
    if (!field.label || !field.type) {
      ctx.response.status = 400;
      ctx.response.body = {
        message: "Invalid field data. 'label' and 'type' are required.",
      };
      return;
    }
    switch (field.type) {
      case "definition": {
        const definitionsData = await Deno.readTextFile(
          "./data/definitions.json"
        );
        const definitions = JSON.parse(definitionsData);
        if (!definitions[field.label]) {
          ctx.response.status = 400;
          ctx.response.body = {
            message: `Invalid field data. '${field.label}' must be an existing definition.`,
          };
          return;
        }
        break;
      }
      case "entity": {
        const entitiesData = await Deno.readTextFile("./data/entities.json");
        const entities = JSON.parse(entitiesData);
        if (!entities[field.label]) {
          ctx.response.status = 400;
          ctx.response.body = {
            message: `Invalid field data. '${field.label}' must be an existing entity.`,
          };
          return;
        }
        break;
      }
      default: {
        ctx.response.status = 400;
        ctx.response.body = {
          message:
            "Invalid field data. 'type' must be 'definition' or 'entity'.",
        };
        return;
      }
    }
  }

  const entities = await readEntities();

  // Check if an entity with the same label already exists.
  if (!entities[name]) {
    ctx.response.status = 404;
    ctx.response.body = {
      message: "Entity not found",
    };
    return;
  }
  entities[name] = { label, fields };
  try {
    await writeEntities(entities);
    ctx.response.status = 200;
    ctx.response.body = {
      message: "Entity updated successfully",
      entity: entities[name],
    };
  } catch (error) {
    ctx.response.status = 400;
    ctx.response.body = { message: error };
  }
};

export const deleteEntity = async (
  ctx: RouterContext<"/api/entity/:name", { name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid entity name" };
    return;
  }

  const entities = await readEntities();

  if (!entities[name]) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Entity not found" };
    return;
  }

  delete entities[name];
  await writeEntities(entities);

  ctx.response.status = 204;
};
