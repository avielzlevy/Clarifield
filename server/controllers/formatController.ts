// controllers/formatController.ts
import { Context, RouterContext } from "../deps.ts";
import { addChange } from "../utils/changes.ts";
import staticFormats from "../data/staticFormats.ts";
import * as formatRepo from "../repositories/formatRepository.ts";

export const getFormats = async (ctx: Context) => {
  try {
    const formats = await formatRepo.getFormats();
    const allFormats = { ...staticFormats, ...formats };
    ctx.response.body = allFormats;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

export const getFormatsAmount = async (ctx: Context) => {
  try {
    const formats = await formatRepo.getFormats();
    const allFormats = { ...staticFormats, ...formats };
    ctx.response.body = { amount: Object.keys(allFormats).length };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

export const addFormat = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const { name, pattern, description } = await value;

  if (!name || !pattern) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid format data" };
    return;
  }

  try {
    await formatRepo.addFormat(name, { pattern, description });
    // Record the change if necessary.
    await addChange({
      type: "formats",
      name,
      timestamp: new Date().toISOString(),
      before: "",
      after: { name, pattern, description },
    });
    ctx.response.status = 201;
    ctx.response.body = { name, pattern };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Format already exists") {
        ctx.response.status = 409;
        ctx.response.body = { message: "Format already exists" };
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

export const updateFormat = async (
  ctx: RouterContext<"/api/formats/:name", { name: string }>
) => {
  const { name } = ctx.params;
  const { value } = ctx.request.body({ type: "json" });
  const { pattern, description } = await value;

  if (!name || !pattern) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid format data" };
    return;
  }

  try {
    const formats = await formatRepo.getFormats();
    if (!formats[name]) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Format not found" };
      return;
    }
    await formatRepo.updateFormat(name, { pattern, description });
    await addChange({
      type: "formats",
      name,
      timestamp: new Date().toISOString(),
      before: formats[name],
      after: { pattern, description },
    });
    ctx.response.status = 204;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Format not found") {
        ctx.response.status = 404;
        ctx.response.body = { message: "Format not found" };
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

export const deleteFormat = async (
  ctx: RouterContext<"/api/formats/:name", { name: string }>
) => {
  const { name } = ctx.params;

  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid format data" };
    return;
  }

  try {
    const formats = await formatRepo.getFormats();
    if (!formats[name]) {
      ctx.response.status = 404;
      ctx.response.body = { message: "Format not found" };
      return;
    }
    await formatRepo.deleteFormat(name);
    await addChange({
      type: "formats",
      name,
      timestamp: new Date().toISOString(),
      before: formats[name],
      after: "",
    });
    ctx.response.status = 204;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message === "Format not found") {
        ctx.response.status = 404;
        ctx.response.body = { message: "Format not found" };
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
