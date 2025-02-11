// controllers/definitionController.ts

import { Context, RouterContext } from "../deps.ts";
import { addChange } from "../utils/changes.ts";
import * as defRepo from "../repositories/definitionRepository.ts";

/**
 * GET /api/definitions
 * Returns all definitions.
 */
export const getDefinitions = async (ctx: Context) => {
  try {
    const definitions = await defRepo.getDefinitions();
    ctx.response.body = definitions;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

/**
 * GET /api/definition/:name
 * Returns a single definition.
 */
export const getDefinition = async (
  ctx: RouterContext<"/api/definition/:name", { name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition name" };
    return;
  }
  try {
    const definition = await defRepo.getDefinition(name);
    if (!definition) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Definition not found" };
      return;
    }
    ctx.response.body = definition;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

/**
 * POST /api/definition
 * Adds a new definition.
 * Expects JSON body: { name: string, format: string, description?: string }
 */
export const addDefinition = async (ctx: Context) => {
  try {
    const { value } = ctx.request.body({ type: "json" });
    const { name, format, description } = await value;

    if (!name || !format) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid definition data" };
      return;
    }

    // Record the change before adding the definition.
    await addChange({
      type: "definitions",
      name,
      timestamp: new Date().toISOString(),
      before: "",
      after: { name, format, description },
    });
    await defRepo.addDefinition(name, {
      format,
      description: description || "",
    });
    ctx.response.status = 201;
    ctx.response.body = { name, format, description };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message && e.message.includes("already exists")) {
        ctx.response.status = 409;
        ctx.response.body = { message: "Definition already exists" };
      } else {
        ctx.response.status = 500;
        ctx.response.body = { message: "Internal server error" };
      }
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: "Internal server error" };
    }
  }
};

/**
 * DELETE /api/definitions/:name
 * Deletes a definition by name.
 */
export const deleteDefinition = async (
  ctx: RouterContext<"/api/definitions/:name", { name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition name" };
    return;
  }
  try {
    const definition = await defRepo.getDefinition(name);
    if (!definition) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Definition not found" };
      return;
    }
    await addChange({
      type: "definitions",
      name,
      timestamp: new Date().toISOString(),
      before: definition,
      after: "",
    });
    await defRepo.deleteDefinition(name);
    ctx.response.status = 204;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message && e.message.includes("not found")) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Definition not found" };
      } else {
        ctx.response.status = 500;
        ctx.response.body = { message: "Internal server error" };
      }
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: "Internal server error" };
    }
  }
};

/**
 * PUT /api/definitions/:name
 * Updates an existing definition.
 * Expects JSON body: { format: string, description?: string }
 */
export const updateDefinition = async (
  ctx: RouterContext<"/api/definitions/:name", { name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition name" };
    return;
  }
  try {
    const { value } = ctx.request.body({ type: "json" });
    const { format, description } = await value;
    if (!format) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid definition data" };
      return;
    }
    const existingDefinition = await defRepo.getDefinition(name);
    if (!existingDefinition) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Definition not found" };
      return;
    }
    await addChange({
      type: "definitions",
      name,
      timestamp: new Date().toISOString(),
      before: existingDefinition,
      after: { name, format, description },
    });
    await defRepo.updateDefinition(name, {
      format,
      description: description || "",
    });
    ctx.response.status = 204;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message && e.message.includes("not found")) {
        ctx.response.status = 404;
        ctx.response.body = { message: "Definition not found" };
      } else {
        ctx.response.status = 500;
        ctx.response.body = { message: "Internal server error" };
      }
    } else {
      ctx.response.status = 500;
      ctx.response.body = { message: "Internal server error" };
    }
  }
};
