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
    const { type, status = "pending", description } = await value;
    const { name } = ctx.params;

    if (!name || !type || !description || !status) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid report data" };
      return;
    }

    await reportRepo.addReport(type, name, description);
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Report added successfully",
      type,
      status,
      name,
      description,
    };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

// Update a report's status
export const updateReport = async (
  ctx: RouterContext<"/api/report/:name", { name: string }>
) => {
  try {
    const { value } = ctx.request.body({ type: "json" });
    // Expecting type, description (to identify the entry), and newStatus.
    const { type, description, status } = await value;
    const { name } = ctx.params;

    if (!name || !type || !description || !status) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid report data" };
      return;
    }

    await reportRepo.updateReport(type, name, description, status);

    ctx.response.status = 200;
    ctx.response.body = {
      message: "Report updated successfully",
      type,
      name,
      description,
      status,
    };
  } catch (_e) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};
