// src/controllers/settingsController.ts

import { Context } from "../deps.ts";
import {
  toPascalCase,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  transformKeys,
  transformEntityKeys,
} from "./nameConvert.ts";
import {
  readDefinitions,
  writeDefinitions,
} from "../repositories/definitionRepository.ts";
import {
  readEntities,
  writeEntities,
} from "../repositories/entityRepository.ts";
import {
  readAnalytics,
  writeAnalytics,
} from "../repositories/analyticRepository.ts";

const DATA_FILE = "./data/settings.json";

interface Settings {
  namingConvention: "snake_case" | "camelCase" | "PascalCase" | "kebab-case";
  sourceSystems: string[];
}

const DEFAULT_SETTINGS: Settings = {
  namingConvention: "snake_case",
  sourceSystems: [],
};

const readSettings = async (): Promise<Settings> => {
  try {
    const raw = await Deno.readTextFile(DATA_FILE);
    return JSON.parse(raw) as Settings;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      await writeSettings(DEFAULT_SETTINGS);
      return { ...DEFAULT_SETTINGS };
    }
    throw e;
  }
};

const writeSettings = async (settings: Settings) => {
  await Deno.writeTextFile(
    DATA_FILE,
    JSON.stringify(settings, null, 2),
  );
};

export const getSettings = async (ctx: Context) => {
  const settings = await readSettings();
  ctx.response.body = settings;
};

export const updateSettings = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const payload = await value;
  const hasNaming = "namingConvention" in payload;
  const hasSources = "sourceSystems" in payload;

  if (!hasNaming && !hasSources) {
    ctx.response.status = 400;
    ctx.response.body = { message: "No valid settings fields provided." };
    return;
  }

  const existing = await readSettings();
  const updated: Settings = {
    namingConvention: hasNaming
      ? payload.namingConvention
      : existing.namingConvention,
    sourceSystems: hasSources
      ? (Array.isArray(payload.sourceSystems)
          ? payload.sourceSystems
          : existing.sourceSystems)
      : existing.sourceSystems,
  };

  await writeSettings(updated);

  // only re-apply naming convention transforms when that field changed
  if (hasNaming) {
    await applyNamingConvention(updated.namingConvention);
  }

  ctx.response.status = 200;
  ctx.response.body = updated;
};

// pull out the renaming logic into its own helper
const applyNamingConvention = async (convention: Settings["namingConvention"]) => {
  const defs = await readDefinitions();
  const ents = await readEntities();
  const an  = await readAnalytics();

  let newDefs = defs;
  let newEnts = ents;
  let newAnal = { ...an, definition: an.definition };

  switch (convention) {
    case "camelCase":
      newDefs = transformKeys(defs, toCamelCase);
      newEnts = transformEntityKeys(ents, toCamelCase, true);
      newAnal = { ...an, definition: transformKeys(an.definition, toCamelCase) };
      break;
    case "PascalCase":
      newDefs = transformKeys(defs, toPascalCase);
      newEnts = transformEntityKeys(ents, toPascalCase, true);
      newAnal = { ...an, definition: transformKeys(an.definition, toPascalCase) };
      break;
    case "kebab-case":
      newDefs = transformKeys(defs, toKebabCase);
      newEnts = transformEntityKeys(ents, toKebabCase, true);
      newAnal = { ...an, definition: transformKeys(an.definition, toKebabCase) };
      break;
    case "snake_case":
    default:
      newDefs = transformKeys(defs, toSnakeCase);
      newEnts = transformEntityKeys(ents, toSnakeCase, true);
      newAnal = { ...an, definition: transformKeys(an.definition, toSnakeCase) };
      break;
  }

  await writeDefinitions(newDefs);
  await writeEntities(newEnts);
  await writeAnalytics(newAnal);
};
