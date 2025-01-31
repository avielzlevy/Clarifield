import { Context, RouterContext } from "../deps.ts";
import { Definition } from "../models/definition.ts";
import {addChange} from "../utils/changes.ts";

const DATA_FILE = "./data/definitions.json";

export const readDefinitions = async (): Promise<{ [name: string]: Definition }> => {
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

export const writeDefinitions = async (definitions: {
  [name: string]: Definition;
}): Promise<void> => {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(definitions, null, 2));
};

export const getDefinitions = async (ctx: Context) => {
  const definitions = await readDefinitions();
  ctx.response.body = definitions;
};

export const getDefinition = async (ctx:RouterContext<"/api/definition/:name",{"name":string}>) => {
  const {name} = ctx.params
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition name" };
    return;
  }
}

export const addDefinition = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const { name, format, description } = await value;

  if (!name || !format) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition data" };
    return;
  }

  const definitions = await readDefinitions();

  if (definitions[name]) {
    ctx.response.status = 409; // Conflict
    ctx.response.body = { message: "Definition already exists" };
    return;
  }
  await addChange({type: "definitions", name, timestamp: new Date().toISOString(), before: "", after: {name, format, description}});
  definitions[name] = { format, description: description || "" };
  await writeDefinitions(definitions);

  ctx.response.status = 201;
  ctx.response.body = { name, format, description };
};

export const deleteDefinition = async (
  ctx: RouterContext<"/api/definitions/:name",{ name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition name" };
    return;
  }

  const definitions = await readDefinitions();

  if (!definitions[name]) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Definition not found" };
    return;
  }
  await addChange({type: "definitions", name, timestamp: new Date().toISOString(), before: definitions[name], after: ""});
  delete definitions[name];
  await writeDefinitions(definitions);

  ctx.response.status = 204;
};

export const updateDefinition = async (
  ctx: RouterContext<"/api/definitions/:name",{ name: string }>
) => {
  const { name } = ctx.params;
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition name" };
    return;
  }

  const { value } = ctx.request.body({ type: "json" });
  const { format, description } = await value;

  if (!format) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid definition data" };
    return;
  }

  const definitions = await readDefinitions();

  if (!definitions[name]) {
    ctx.response.status = 404;
    ctx.response.body = { message: "Definition not found" };
    return;
  }
  await addChange({type: "definitions", name, timestamp: new Date().toISOString(), before: definitions[name], after: {name, format, description}});
  definitions[name] = { format, description: description || "" };
  await writeDefinitions(definitions);

  ctx.response.status = 204;
}