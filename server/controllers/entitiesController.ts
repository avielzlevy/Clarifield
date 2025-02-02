import { Context, RouterContext } from "../deps.ts";
import { Entity } from "../models/entities.ts";

const DATA_FILE = "./data/entities.json";
// Utility functions to read and write the analytics file
const readEntities = async ()=>{
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
const writeEntities = async (entities: { [type: string]: Entity })=>{
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(entities, null, 2));
}
// Get all analytics
export const getEntities = async (ctx: Context)=>{
  const entities = await readEntities();
  ctx.response.body = entities;
};
// Add or update a report
export const addEntity = async (ctx: Context)=>{
  const { value } = ctx.request.body({
    type: "json"
  });
  const { name, children } = await value;
  // Validate input
  if (!name) {
    ctx.response.status = 400;
    ctx.response.body = {
      message: "Invalid entity data"
    };
    return;
  }
  const entities = await readEntities();
  // Add or update the report under the type and name
  if (entities[name]) {
    ctx.response.status = 409;
    ctx.response.body = {
      message: "Entity already exists"
    };
    return;
  }
  entities[name] = { label: name, children };
  await writeEntities(entities);
  ctx.response.status = 201;
  ctx.response.body = {
    message: "Entity added successfully",
    name,
    children
  };
}