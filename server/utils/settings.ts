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

const readSettings = async (): Promise<{ [key: string]: any }> => {
  try {
    const data = await Deno.readTextFile(DATA_FILE);
    return JSON.parse(data);
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      //default settings
      await Deno.writeTextFile(
        DATA_FILE,
        JSON.stringify({
          namingConvention: "snake_case",
        })
      );
    }
    return {};
  }
};

const writeSettings = async (settings: { [key: string]: any }) => {
  await Deno.writeTextFile(DATA_FILE, JSON.stringify(settings, null, 2));
};

export const getSettings = async (ctx: Context) => {
  const changes = await readSettings();
  ctx.response.body = changes;
};

export const updateSettings = async (ctx: Context) => {
  const { value } = ctx.request.body({ type: "json" });
  const { namingConvention } = await value;

  if (!namingConvention) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Invalid settings data" };
    return;
  }

  const settings = await readSettings();
  // add new fields
  const updatedSettings = { ...settings, namingConvention };
  await writeSettings(updatedSettings);
  await ApplySettings(updatedSettings);
  ctx.response.status = 201;
  ctx.response.body = updatedSettings;
};

const ApplySettings = async (settings: { [key: string]: any }) => {
  const definitions = await readDefinitions();
  const entities = await readEntities();
  const analytics = await readAnalytics();
  let newDefinitions = definitions;
  let newEntities = entities;
  let newAnalytics = analytics;
  switch (settings.namingConvention) {
    case "camelCase":
      newDefinitions = transformKeys(definitions, toCamelCase);
      newEntities = transformEntityKeys(entities, toCamelCase, true);
      newAnalytics = {...analytics, definition: transformKeys(analytics.definition, toCamelCase)};
      break;
    case "PascalCase":
      newDefinitions = transformKeys(definitions, toPascalCase);
      newEntities = transformEntityKeys(entities, toPascalCase, true);
      newAnalytics = {...analytics, definition: transformKeys(analytics.definition, toPascalCase)};
      break;
    case "kebab-case":
      newDefinitions = transformKeys(definitions, toKebabCase);
      newEntities = transformEntityKeys(entities, toKebabCase, true);
      newAnalytics = {...analytics, definition: transformKeys(analytics.definition, toKebabCase)};
      break;
    case "snake_case":
    default:
      newDefinitions = transformKeys(definitions, toSnakeCase);
      newEntities = transformEntityKeys(entities, toSnakeCase, true);
      newAnalytics = {...analytics, definition: transformKeys(analytics.definition, toSnakeCase)};
      break;
  }
  await writeDefinitions(newDefinitions);
  await writeEntities(newEntities);
  await writeAnalytics(newAnalytics);
};
