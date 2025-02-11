// controllers/reportController.ts

import { Context, RouterContext } from "../deps.ts";
import * as reportRepo from "../repositories/reportRepository.ts";

// Get all reports
export const getReports = async (ctx: Context) => {
  try {
    const reports = await reportRepo.getReports();
    ctx.response.body = reports;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

// Add (or update) a report
export const addReport = async (
  ctx: RouterContext<"/api/report/:name", { name: string }>
) => {
  try {
    const { value } = ctx.request.body({ type: "json" });
    const { type, description } = await value;
    const { name } = ctx.params;

    if (!name || !type || !description) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid report data" };
      return;
    }

    await reportRepo.addReport(type, name, description);
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Report added successfully",
      type,
      name,
      description,
    };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

// Delete a specific report by type and name
export const deleteReport = async (
  ctx: RouterContext<"/api/report/:type/:name", { type: string; name: string }>
) => {
  try {
    const { type, name } = ctx.params;
    if (!type || !name) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid report type or name" };
      return;
    }
    await reportRepo.deleteReport(type, name);
    ctx.response.status = 204;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message && e.message.includes("not found")) {
        ctx.response.status = 404;
        ctx.response.body = { message: e.message };
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

// Clear all reports for a specific type
export const clearReportsByType = async (
  ctx: RouterContext<"/api/report/type/:type", { type: string }>
) => {
  try {
    const { type } = ctx.params;
    if (!type) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid report type" };
      return;
    }
    await reportRepo.clearReportsByType(type);
    ctx.response.status = 204;
  } catch (e) {
    if (e instanceof Error) {
      if (e.message && e.message.includes("not found")) {
        ctx.response.status = 404;
        ctx.response.body = { message: e.message };
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

// Clear all reports (optional)
export const clearAllReports = async (ctx: Context) => {
  try {
    await reportRepo.clearAllReports();
    ctx.response.status = 204;
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};
