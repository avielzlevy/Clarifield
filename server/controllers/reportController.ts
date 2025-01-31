import { Context, RouterContext } from "../deps.ts";
import { Reports } from "../models/report.ts";

const DATA_FILE = "./data/reports.json";

// Utility functions to read and write the reports file
const readReports = async (): Promise<{ [type: string]: { [name: string]: string[] } }> => {
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

const writeReports = async (reports: Reports): Promise<void> => {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(reports, null, 2));
};

// Get all reports
export const getReports = async (ctx: Context) => {
  const reports = await readReports();
  ctx.response.body = reports;
};

// Add or update a report
export const addReport = async (
  ctx: RouterContext<"/api/report/:name", { name: string }>
) => {
  const { value } = ctx.request.body({ type: "json" });
  const { type, description } = await value;
  const { name } = ctx.params;

  // Validate input
  if (!name || !type || !description) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid report data" };
    return;
  }

  const reports = await readReports();

  // Ensure the main structure is present for the type (e.g., "format" or "definition")
  if (!reports[type]) {
    reports[type] = {};
  }

  // Add or update the report under the type and name
  if (reports[type][name]) {
    reports[type][name].push(description);
  } else {
    reports[type][name] = [description];
  }

  await writeReports(reports);

  ctx.response.status = 201;
  ctx.response.body = { message: "Report added successfully", type, name, description };
};

// Delete a specific report by type and name
export const deleteReport = async (
  ctx: RouterContext<"/api/report/:type/:name", { type: string; name: string }>
) => {
  const { type, name } = ctx.params;

  // Validate input
  if (!type || !name) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid report type or name" };
    return;
  }

  const reports = await readReports();

  // Check if the type exists
  if (!reports[type]) {
    ctx.response.status = 404;
    ctx.response.body = { message: `Type '${type}' not found` };
    return;
  }

  // Check if the name exists under the type
  if (!reports[type][name]) {
    ctx.response.status = 404;
    ctx.response.body = { message: `Name '${name}' not found under type '${type}'` };
    return;
  }

  // Delete the name under the type
  delete reports[type][name];

  // If the type is empty after deletion, remove the type
  if (Object.keys(reports[type]).length === 0) {
    delete reports[type];
  }

  await writeReports(reports);

  ctx.response.status = 204;
};

// Clear all reports of a specific type
export const clearReportsByType = async (
  ctx: RouterContext<"/api/report/type/:type", { type: string }>
) => {
  const { type } = ctx.params;

  // Validate input
  if (!type) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid report type" };
    return;
  }

  const reports = await readReports();

  // Check if the type exists
  if (!reports[type]) {
    ctx.response.status = 404;
    ctx.response.body = { message: `Type '${type}' not found` };
    return;
  }

  // Remove all entries under the type
  delete reports[type];

  await writeReports(reports);

  ctx.response.status = 204;
};

// Clear all reports (optional utility)
export const clearAllReports = async (ctx: Context) => {
  await writeReports({});
  ctx.response.status = 204;
};

