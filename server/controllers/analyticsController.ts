// controllers/analyticsController.ts

import { Context } from "../deps.ts";
import * as analyticsRepo from "../repositories/analyticRepository.ts";

/**
 * GET /api/analytics
 * Returns all analytics records.
 */
export const getAnalytics = async (ctx: Context) => {
  try {
    const analytics = await analyticsRepo.getAnalytics();
    ctx.response.body = analytics;
  } catch (error) {
    console.log(`Error in getAnalytics: ${error}`);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};

/**
 * POST /api/analytic
 * Adds (or updates) an analytic record.
 * Expects a JSON body: { name: string, type: string, amount: number }
 */
export const addAnalytic = async (ctx: Context) => {
  try {
    const { value } = ctx.request.body({ type: "json" });
    const { name, type, amount } = await value;

    // Validate input.
    if (!name || !type || amount === undefined) {
      ctx.response.status = 400;
      ctx.response.body = { message: "Invalid report data" };
      return;
    }
    if (typeof amount !== "number") {
      ctx.response.status = 400;
      ctx.response.body = { message: "Amount must be a number" };
      return;
    }

    await analyticsRepo.addAnalytic(type, name, amount);
    ctx.response.status = 201;
    ctx.response.body = {
      message: "Report added successfully",
      type,
      name,
      amount,
    };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal server error" };
  }
};
