import { Context, RouterContext } from "../deps.ts";
import { Format } from "../models/format.ts";
import { addChange } from "../utils/changes.ts";

const DATA_FILE = "./data/formats.json";
import staticFormats from "../data/staticFormats.ts";

const readFormats = async (): Promise<{ [name: string]: Format }> => {
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

const writeFormats = async (formats: {
  [name: string]: Format;
}): Promise<void> => {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(formats, null, 2));
};

export const getFormats = async (ctx: Context) => {
  const formats = await readFormats();
  const allFormats = { ...staticFormats, ...formats };
  ctx.response.body = allFormats;
};

export const addFormat = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const { name, pattern,description } = await value;

  if (!name || !pattern) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid format data" };
    return;
  }

  const formats = await readFormats();

  if (formats[name]) {
    ctx.response.status = 409; // Conflict
    ctx.response.body = { message: "Format already exists" };
    return;
  }
  await addChange({type: "formats", name, timestamp: new Date().toISOString(), before: "", after: {name, pattern, description}});
  formats[name] = { pattern,description };
  await writeFormats(formats);

  ctx.response.status = 201;
  ctx.response.body = { name, pattern };
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

  const formats = await readFormats();

  if (!formats[name]) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Format not found" };
    return;
  }
  await addChange({type: "formats", name, timestamp: new Date().toISOString(), before: formats[name], after: ""});
  delete formats[name];
  await writeFormats(formats);

  ctx.response.status = 204; // No Content
};

export const updateFormat = async (
  ctx: RouterContext<"/api/formats/:name", { name: string }>
) => {
  const { name } = ctx.params;
  const { value } = ctx.request.body({ type: "json" });
  const { pattern,description } = await value;

  if (!name || !pattern) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid format data" };
    return;
  }

  const formats = await readFormats();

  if (!formats[name]) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Format not found" };
    return;
  }
  await addChange({type: "formats", name, timestamp: new Date().toISOString(), before: formats[name], after: {pattern, description}});
  formats[name] = { pattern,description };
  await writeFormats(formats);

  ctx.response.status = 204;
}
