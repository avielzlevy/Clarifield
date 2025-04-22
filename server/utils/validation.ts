// src/services/validate.ts
import { Context } from "../deps.ts";
import { Definition } from "../models/definition.ts";
import staticFormats from "../data/staticFormats.ts";
import { getDefinitions } from "../repositories/definitionRepository.ts";
import { getFormats } from "../repositories/formatRepository.ts";
import RandExp from "randexp";

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
        `Invalid value "${val}" for "${currentPath}": does not match "${fmt.pattern}" \n example of valid value: "${generateExample(fmt.pattern)}"`
      );
    }
  }
};

/**
 * generateExample
 * @param   {string|RegExp} pattern — a regex (or string) describing your format.
 * @returns {string}           — a randomly generated string that matches `pattern`.
 *
 * Examples:
 *   generateExample('\\d{2,8}')           // e.g. "4759"
 *   generateExample(/US-[A-Z]{3}\\d{2}/)  // e.g. "US-XQJ84"
 */
export function generateExample(pattern: string | RegExp): string {
  // normalize to RegExp
  const regex =
    pattern instanceof RegExp ? pattern : new RegExp(`^${pattern}$`);

  // fallback: simple digit‐only patterns like \d{2,5}
  const fallbackMatch = regex.source.match(/^\\d\{(\d+)(?:,(\d+))?\}$/);
  if (fallbackMatch) {
    const min = parseInt(fallbackMatch[1], 10);
    const max = fallbackMatch[2] != null ? parseInt(fallbackMatch[2], 10) : min;
    const len = min + Math.floor(Math.random() * (max - min + 1));
    let s = "";
    for (let i = 0; i < len; i++) {
      s += Math.floor(Math.random() * 10);
    }
    return s;
  }

  // otherwise delegate to RandExp for full support
  return new RandExp(regex).gen();
}

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
