// src/services/validate.ts
import { Context } from "../deps.ts";
import { Definition } from "../models/definition.ts";
import staticFormats from "../data/staticFormats.ts";
import { getDefinitions } from "../repositories/definitionRepository.ts";
import { getFormats } from "../repositories/formatRepository.ts";

const validateObject = (
  obj: any,
  definitions: Record<string, Definition>,
  formats: Record<string, { pattern: string }>,
  errors: string[],
  path = ""
) => {
  for (const key of Object.keys(obj)) {
    const currentPath = path ? `${path}.${key}` : key;

    const def = definitions[key];
    if (!def) {
      errors.push(`Key "${currentPath}" is not defined in the policy`);
      continue;
    }

    const fmt = formats[def.format];
    if (!fmt) {
      errors.push(
        `Definition for "${currentPath}" references unknown format "${def.format}"`
      );
      continue;
    }

    const val = obj[key];
    if (val !== null && typeof val === "object") {
      validateObject(val, definitions, formats, errors, currentPath);
    } else if (!new RegExp(fmt.pattern).test(String(val))) {
      errors.push(
        `Invalid value "${val}" for "${currentPath}": does not match "${fmt.pattern}"`
      );
    }
  }
};

export const validate = async (ctx: Context) => {
  // parse JSON body
  let payload: unknown;
  try {
    payload = await ctx.request.body({ type: "json" }).value;
  } catch {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid JSON body" };
    return;
  }

  // fetch definitions & formats from your repositories
  let definitions: Record<string, Definition>;
  let fileFormats: Record<string, { pattern: string; description?: string }>;
  try {
    definitions = await getDefinitions();
  } catch (e) {
    console.error("Failed to load definitions:", e);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal error loading definitions" };
    return;
  }
  try {
    fileFormats = await getFormats();
  } catch (e) {
    console.error("Failed to load formats:", e);
    ctx.response.status = 500;
    ctx.response.body = { message: "Internal error loading formats" };
    return;
  }

  // merge in‑code static formats with those from storage
  const formats = { ...staticFormats, ...fileFormats };

  // run recursive validation
  const errors: string[] = [];
  if (payload && typeof payload === "object") {
    validateObject(payload, definitions, formats, errors);
  } else {
    errors.push("Payload must be a JSON object");
  }

  if (errors.length) {
    ctx.response.status = 400;
    ctx.response.body = { errors };
  } else {
    ctx.response.status = 200;
    ctx.response.body = { message: "All values are valid" };
  }
};
