// controllers/entityController.ts

import { Context, RouterContext } from "../deps.ts";
import { Entity } from "../models/entities.ts";
import { addChange } from "../utils/changes.ts";
import * as entityRepo from "../repositories/entityRepository.ts";
import * as definitionRepo from "../repositories/definitionRepository.ts";

/**
 * GET /api/entities
 */
export const getEntities = async (ctx: Context) => {
  try {
    const entities = await entityRepo.getEntities();
    ctx.response.body = entities;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

/**
 * GET /api/entities/amount
 */
export const getEntitiesAmount = async (ctx: Context) => {
  try {
    const entities = await entityRepo.getEntities();
    ctx.response.body = { amount: Object.keys(entities).length };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
}

/**
 * POST /api/entity
 * Expected JSON body: { label: string, fields: Array<{ label: string, type: string }> }
 */
export const addEntity = async (ctx: Context) => {
  try {
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
    const definitionsMap = await definitionRepo.getDefinitions();
    const entitiesMap = await entityRepo.getEntities();
    // Validate each field.
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
          // Read the definitions file.
          try {
            if (!definitionsMap[field.label]) {
              ctx.response.status = 400;
              ctx.response.body = {
                message: `Invalid field data. '${field.label}' must be an existing definition.`,
              };
              return;
            }
          } catch (_e) {
            ctx.response.status = 500;
            ctx.response.body = { message: "Error reading definitions" };
            return;
          }
          break;
        }
        case "entity": {
          // Validate by checking the stored entities via the repository.

          if (!entitiesMap[field.label]) {
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

    // Check for duplicate entity.
    const entities = await entityRepo.getEntities();
    if (entities[label]) {
      ctx.response.status = 409;
      ctx.response.body = { message: "Entity already exists" };
      return;
    }

    const newEntity: Entity = { label, fields };

    await entityRepo.addEntity(newEntity);
    await addChange({
      type: "entities",
      name,
      timestamp: new Date().toISOString(),
      before: "",
      after: { name, fields:fields.map((f) => f.label) },
    });
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Entity added successfully",
      entity: newEntity,
    };
  } catch (error) {
    if (error instanceof Error) {
      ctx.response.status = 500;
      ctx.response.body = { message: error.message || error };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: `Internal server error` };
    }
  }
};

/**
 * PUT /api/entity/:name
 * Expected URL parameter: name (the current entity label)
 * Expected JSON body: { label: string, fields: Array<{ label: string, type: string }> }
 */
export const updateEntity = async (
  ctx: RouterContext<"/api/entity/:name", { name: string }>
) => {
  try {
    const { name } = ctx.params;
    if (!name) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid entity name" };
      return;
    }

    const { value } = ctx.request.body({ type: "json" });
    const { label, fields } = await value;

    if (!label || !fields || !Array.isArray(fields)) {
      ctx.response.status = 400;
      ctx.response.body = {
        message:
          "Invalid entity data. 'label' and 'fields' (as an array) are required.",
      };
      return;
    }
    const definitionsMap = await definitionRepo.getDefinitions();
    const entitiesMap = await entityRepo.getEntities();
    // Validate each field.
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
          try {
            if (!definitionsMap[field.label]) {
              ctx.response.status = 400;
              ctx.response.body = {
                message: `Invalid field data. '${field.label}' must be an existing definition.`,
              };
              return;
            }
          } catch (_e) {
            ctx.response.status = 500;
            ctx.response.body = { message: "Error reading definitions" };
            return;
          }
          break;
        }
        case "entity": {
          if (!entitiesMap[field.label]) {
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

    // Check if the entity to update exists.
    const existingEntities = await entityRepo.getEntities();
    if (!existingEntities[name]) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Entity not found" };
      return;
    }

    const updatedEntity: Entity = { label, fields };

    await entityRepo.updateEntity(name, updatedEntity);
    await addChange({
      type: "entities",
      name,
      timestamp: new Date().toISOString(),
      before: { name, fields:existingEntities[name].fields.map((f) => f.label) },
      after: { name, fields:fields.map((f) => f.label) },
    });
    ctx.response.status = 200;
    ctx.response.body = {
      message: "Entity updated successfully",
      entity: updatedEntity,
    };
  } catch (error) {
    if (error instanceof Error) {
      ctx.response.status = 500;
      ctx.response.body = { message: error.message || error };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: `Internal server error` };
    }
  }
};

/**
 * DELETE /api/entity/:name
 */
//TODO: delete entity in all entities that have it as a field
export const deleteEntity = async (
  ctx: RouterContext<"/api/entity/:name", { name: string }>
) => {
  try {
    const { name } = ctx.params;
    if (!name) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid entity name" };
      return;
    }

    // Check if the entity exists.
    const entities = await entityRepo.getEntities();
    if (!entities[name]) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Entity not found" };
      return;
    }

    await entityRepo.deleteEntity(name);
    await addChange({
      type: "entities",
      name,
      timestamp: new Date().toISOString(),
      before: entities[name],
      after: "",
    });
    ctx.response.status = 204;
  } catch (error) {
    if (error instanceof Error) {
      ctx.response.status = 500;
      ctx.response.body = { message: error.message || error };
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: `Internal server error` };
    }
  }
};
