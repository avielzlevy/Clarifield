import { Context, RouterContext } from "../deps.ts";
import { Analytics } from "../models/analytics.ts";

const DATA_FILE = "./data/analytics.json";
// Utility functions to read and write the analytics file
const readAnalytics = async ()=>{
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
const writeAnalytics = async (analytics 
    : { [type: string]: Analytics })=>{
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(analytics, null, 2));
};
// Get all analytics
export const getAnalytics = async (ctx: Context)=>{
  const analytics = await readAnalytics();
  ctx.response.body = analytics;
};
// Add or update a report
export const addAnalytic = async (ctx: Context)=>{
  const { value } = ctx.request.body({
    type: "json"
  });
  const { name, type, amount } = await value;
  // Validate input
  if (!name || !type || !amount) {
    ctx.response.status = 400;
    ctx.response.body = {
      message: "Invalid report data"
    };
    return;
  }
  const analytics = await readAnalytics();
  // Ensure the main structure is present for the type (e.g., "format" or "definition")
  if (!analytics[type]) {
    analytics[type] = {};
  }
  // Add or update the report under the type and name
  if (analytics[type][name]) {
    analytics[type][name] += amount;
  } else {
    analytics[type][name] = amount;
  }
  await writeAnalytics(analytics);
  ctx.response.status = 201;
  ctx.response.body = {
    message: "Report added successfully",
    type,
    name,
    amount
  };
};